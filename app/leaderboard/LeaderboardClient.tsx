"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSlurpPlayerState } from "@/hooks/useSlurpPlayerState";

type LeaderboardRow = { id: string; username: string; shotsTaken: number };

type LeaderboardResponse = {
  sessionId: string;
  shotUnitCount: number;
  players: LeaderboardRow[];
};

async function fetchLeaderboard(
  sessionId: string
): Promise<LeaderboardResponse> {
  const res = await fetch(
    `/api/leaderboard?session=${encodeURIComponent(sessionId)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return (await res.json()) as LeaderboardResponse;
}

export default function LeaderboardClient() {
  const searchParams = useSearchParams();
  const sessionFromUrl = searchParams.get("session") ?? "";

  const { checked, state } = useSlurpPlayerState();
  const sessionId = sessionFromUrl || state?.sessionId || "";

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", sessionId],
    queryFn: () => fetchLeaderboard(sessionId),
    enabled: !!sessionId,
  });

  const mePlayerId = state?.playerId;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-linear-to-b from-yellow-50 via-white to-zinc-50 px-4 py-8 dark:from-zinc-950 dark:via-black dark:to-black">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-400/25 blur-3xl dark:bg-yellow-400/15" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl dark:bg-yellow-400/10" />
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-yellow-500">Slurp</div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Leaderboard
            </h1>
            <div className="mt-2 h-1 w-12 rounded-full bg-yellow-400" />
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Who’s in the lead?
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
            >
              Join
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-yellow-400 px-3 text-sm font-semibold text-yellow-950"
            >
              Me
            </Link>
          </div>
        </div>

        {!checked && !sessionFromUrl ? (
          <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-900/80 dark:bg-zinc-950/70 dark:text-zinc-400">
            Loading…
          </div>
        ) : null}

        {checked && !sessionId ? (
          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-200">
            No session selected. Go back to{" "}
            <Link className="underline" href="/">
              join
            </Link>
            .
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-900/80 dark:bg-zinc-950/70">
          {leaderboardQuery.isLoading ? (
            <div className="px-2 py-6 text-sm text-zinc-600 dark:text-zinc-400">
              Loading leaderboard…
            </div>
          ) : null}

          {leaderboardQuery.isError ? (
            <div className="px-2 py-6 text-sm text-red-700 dark:text-red-300">
              Could not load leaderboard.
            </div>
          ) : null}

          {leaderboardQuery.data ? (
            <div className="flex flex-col gap-2">
              {leaderboardQuery.data.players.length === 0 ? (
                <div className="px-2 py-6 text-sm text-zinc-600 dark:text-zinc-400">
                  No players yet.
                </div>
              ) : null}

              {leaderboardQuery.data.players.map((p, idx) => {
                const isMe = mePlayerId && p.id === mePlayerId;

                const rankPill =
                  idx === 0
                    ? "bg-yellow-400 text-yellow-950"
                    : idx === 1
                    ? "bg-yellow-200 text-yellow-950 dark:bg-yellow-400/20 dark:text-yellow-200"
                    : idx === 2
                    ? "bg-yellow-100 text-yellow-950 dark:bg-yellow-400/10 dark:text-yellow-200"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100";

                return (
                  <div
                    key={p.id}
                    className={
                      "flex items-center justify-between rounded-2xl border px-4 py-3 " +
                      (isMe
                        ? "border-yellow-300 bg-yellow-50 dark:border-yellow-500/40 dark:bg-yellow-500/10"
                        : "border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold " +
                          rankPill
                        }
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {p.username}
                        </div>
                        {isMe ? (
                          <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                            You
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {p.shotsTaken.toFixed(1)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        shots
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
