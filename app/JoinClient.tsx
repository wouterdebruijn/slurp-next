"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { FieldError, FieldLabel, FieldRoot } from "@/components/form/Field";
import NumberInput from "@/components/form/NumberInput";
import SelectInput from "@/components/form/SelectInput";
import TextInput from "@/components/form/TextInput";
import { writeSlurpPlayerState } from "@/utils/slurpStorage";

type Session = { id: string; shortcode: string };

async function fetchSessions(): Promise<Session[]> {
  const res = await fetch("/api/sessions", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load sessions");
  const data = (await res.json()) as { sessions: Session[] };
  return data.sessions;
}

async function createPlayer(input: {
  sessionId: string;
  username: string;
  shotglassId: number;
}): Promise<{
  player: {
    id: string;
    sessionId: string;
    username: string;
    shotglassId: number;
  };
}> {
  const res = await fetch("/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to join session");
  }

  return (await res.json()) as {
    player: {
      id: string;
      sessionId: string;
      username: string;
      shotglassId: number;
    };
  };
}

export default function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialShotglassId = useMemo(() => {
    const raw =
      searchParams.get("shotglassId") ??
      searchParams.get("shotglass") ??
      searchParams.get("id");
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
  }, [searchParams]);

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  const joinMutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: (data) => {
      writeSlurpPlayerState({
        playerId: data.player.id,
        sessionId: data.player.sessionId,
        username: data.player.username,
        shotglassId: data.player.shotglassId,
      });
      router.push(
        `/leaderboard?session=${encodeURIComponent(data.player.sessionId)}`
      );
    },
  });

  const form = useForm({
    defaultValues: {
      sessionId: "",
      username: "",
      shotglassId: initialShotglassId,
    },
    onSubmit: async ({ value }) => {
      await joinMutation.mutateAsync({
        sessionId: value.sessionId,
        username: value.username.trim(),
        shotglassId: Number(value.shotglassId),
      });
    },
  });

  return (
    <div className="relative min-h-dvh overflow-hidden bg-linear-to-b from-yellow-50 via-white to-zinc-50 px-4 py-8 dark:from-zinc-950 dark:via-black dark:to-black">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-400/25 blur-3xl dark:bg-yellow-400/15" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl dark:bg-yellow-400/10" />
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-900/80 dark:bg-zinc-950/70">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-950">
              Slurp
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Join a session
            </h1>
            <div className="mt-3 h-1 w-12 rounded-full bg-yellow-400" />
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Pick a session, claim your glass, and keep score.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.Field
              name="sessionId"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Pick a session" : undefined,
              }}
            >
              {(field) => (
                <FieldRoot>
                  <FieldLabel>Session</FieldLabel>
                  <SelectInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={sessionsQuery.isLoading}
                  >
                    <option value="">Select an active session</option>
                    {(sessionsQuery.data ?? []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortcode}
                      </option>
                    ))}
                  </SelectInput>
                  {field.state.meta.errors?.[0] ? (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  ) : null}
                  {sessionsQuery.isError ? (
                    <FieldError>Could not load sessions</FieldError>
                  ) : null}
                </FieldRoot>
              )}
            </form.Field>

            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "Your name is required" : undefined,
              }}
            >
              {(field) => (
                <FieldRoot>
                  <FieldLabel>Name</FieldLabel>
                  <TextInput
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Wouter"
                    autoComplete="nickname"
                  />
                  {field.state.meta.errors?.[0] ? (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  ) : null}
                </FieldRoot>
              )}
            </form.Field>

            <form.Field
              name="shotglassId"
              validators={{
                onChange: ({ value }) =>
                  Number(value) > 0 ? undefined : "Enter a shotglass id",
              }}
            >
              {(field) => (
                <FieldRoot>
                  <FieldLabel>Shotglass ID</FieldLabel>
                  <NumberInput
                    value={String(field.state.value ?? "")}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="123"
                  />
                  {field.state.meta.errors?.[0] ? (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  ) : null}
                </FieldRoot>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={joinMutation.isPending}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-yellow-950 transition hover:bg-yellow-300 disabled:opacity-60"
            >
              {joinMutation.isPending ? "Joining…" : "Join"}
            </button>

            {joinMutation.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
                {joinMutation.error instanceof Error
                  ? joinMutation.error.message
                  : "Could not join"}
              </div>
            ) : null}
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already in? Open{" "}
          <Link className="underline" href="/leaderboard">
            leaderboard
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
