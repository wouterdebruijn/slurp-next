"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPlayer, getActiveSessions } from "@/app/actions/session-actions";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SuccessScreen } from "./join-session/success-screen";
import { FormHeader } from "./join-session/form-header";
import { SessionSelector } from "./join-session/session-selector";
import { HardwareIdInput } from "./join-session/hardware-id-input";
import { UsernameInput } from "./join-session/username-input";
import { ErrorDisplay } from "./join-session/error-display";
import { SubmitButton } from "./join-session/submit-button";
import { ViewLeaderboardButton } from "./join-session/view-leaderboard-button";
import { FormFooter } from "./join-session/form-footer";

const joinSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be less than 20 characters"),
  hardwareId: z.string().min(1, "Glass ID is required"),
  sessionId: z.string().min(1, "Please select a session"),
});

type JoinFormData = z.infer<typeof joinSchema>;

interface JoinSessionFormProps {
  shotglasId?: string;
}

export function JoinSessionForm({ shotglasId = "" }: JoinSessionFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: getActiveSessions,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: { hardwareId: shotglasId },
  });

  const sessionId = useWatch({ control, name: "sessionId" }) || "";

  // Derive selected session from sessionId and sessions
  const selectedSession =
    sessionId && sessions
      ? sessions.find((s) => s.id === sessionId) || null
      : null;

  // Auto-select first session when sessions load
  useEffect(() => {
    if (sessions && sessions.length > 0 && !sessionId) {
      setValue("sessionId", sessions[0].id);
    }
  }, [sessions, sessionId, setValue]);

  const onSubmit = async (data: JoinFormData) => {
    setError("");

    startTransition(async () => {
      const result = await createPlayer({
        username: data.username,
        sessionId: data.sessionId,
        hardwareId: data.hardwareId,
      });

      if (result.success && result.player) {
        setSuccess(true);
        // Redirect to leaderboard after a short delay
        setTimeout(() => {
          router.push(
            `/leaderboard?session=${data.sessionId}&player=${result.player!.id}`
          );
        }, 2000);
      } else {
        setError(result.error || "Failed to join session");
      }
    });
  };

  if (success) {
    return (
      <SuccessScreen selectedSessionShortcode={selectedSession?.shortcode} />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <FormHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SessionSelector
            sessions={sessions}
            isLoading={isLoading}
            register={register}
            errors={errors}
          />

          {!shotglasId && (
            <HardwareIdInput register={register} errors={errors} />
          )}

          <UsernameInput register={register} errors={errors} />

          <ErrorDisplay error={error} />

          <SubmitButton
            isPending={isPending}
            isLoading={isLoading}
            sessions={sessions}
          />

          <ViewLeaderboardButton
            selectedSession={selectedSession}
            isLoading={isLoading}
            sessions={sessions}
          />
        </form>

        <FormFooter />
      </div>
    </div>
  );
}
