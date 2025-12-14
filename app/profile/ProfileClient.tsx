"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import Sparkline from "@/components/Sparkline";
import { useSlurpPlayerState } from "@/hooks/useSlurpPlayerState";
import { clearSlurpPlayerState } from "@/utils/slurpStorage";

type ProfileResponse = {
  player: {
    id: string;
    username: string;
    sessionId: string;
    shotglassId: number | null;
  };
  points: { updated: string; units: number; shots: number }[];
  totalShots: number;
  shotUnitCount: number;
};

async function fetchProfile(playerId: string): Promise<ProfileResponse> {
  const res = await fetch(
    `/api/profile?player=${encodeURIComponent(playerId)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as ProfileResponse;
}

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerFromUrl = searchParams.get("player") ?? "";

  const { checked, state } = useSlurpPlayerState();
  const playerId = playerFromUrl || state?.playerId || "";

  const profileQuery = useQuery({
    queryKey: ["profile", playerId],
    queryFn: () => fetchProfile(playerId),
    enabled: !!playerId,
  });

  const cumulative = useMemo(() => {
    const pts = profileQuery.data?.points ?? [];
    const values: number[] = [];
    let sum = 0;
    for (const p of pts) {
      sum += p.shots;
      values.push(sum);
    }
    return values;
  }, [profileQuery.data]);

  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  function leaveSession() {
    clearSlurpPlayerState();
    setConfirmLeaveOpen(false);
    router.push("/");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-linear-to-b from-yellow-50 via-white to-zinc-50 px-4 py-8 dark:from-zinc-950 dark:via-black dark:to-black">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-400/25 blur-3xl dark:bg-yellow-400/15" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl dark:bg-yellow-400/10" />
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-yellow-500">Slurp</div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Profile
            </h1>
            <div className="mt-2 h-1 w-12 rounded-full bg-yellow-400" />
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Your stats for this session.
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/leaderboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-yellow-400 px-3 text-sm font-semibold text-yellow-950"
            >
              Leaderboard
            </Link>
            <button
              type="button"
              onClick={() => setConfirmLeaveOpen(true)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Leave
            </button>
          </div>
        </div>

        {confirmLeaveOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-8 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Leave session confirmation"
            onMouseDown={() => setConfirmLeaveOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Leave session?
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                This will remove your saved player from this device. You can
                join again later.
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmLeaveOpen(false)}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={leaveSession}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-yellow-950 transition hover:bg-yellow-300"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {!checked && !playerFromUrl ? (
          <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-900/80 dark:bg-zinc-950/70 dark:text-zinc-400">
            Loading…
          </div>
        ) : null}

        {checked && !playerId ? (
          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-200">
            No player selected. Join first on{" "}
            <Link className="underline" href="/">
              the join page
            </Link>
            .
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-900/80 dark:bg-zinc-950/70">
          {profileQuery.isLoading ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading…
            </div>
          ) : null}

          {profileQuery.isError ? (
            <div className="text-sm text-red-700 dark:text-red-300">
              Could not load profile.
            </div>
          ) : null}

          {profileQuery.data ? (
            <div className="flex flex-col gap-6">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Name
                </div>
                <div className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {profileQuery.data.player.username}
                </div>
                {profileQuery.data.player.shotglassId ? (
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Shotglass #{profileQuery.data.player.shotglassId}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-yellow-200 bg-linear-to-br from-yellow-50 to-white p-4 dark:border-yellow-500/20 dark:from-yellow-500/10 dark:to-zinc-950">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                      Total
                    </div>
                    <div className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {profileQuery.data.totalShots.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    shots
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Shots over time
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {profileQuery.data.points.length} entries
                  </div>
                </div>

                {profileQuery.data.points.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
                    No shots yet.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                    <Sparkline values={cumulative} />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
