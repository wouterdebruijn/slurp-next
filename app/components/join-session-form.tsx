"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPlayer, getActiveSessions } from "@/app/actions/session-actions";
import { SessionsResponse } from "@/pocketbase-types";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

const joinSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be less than 20 characters"),
  hardwareId: z.string().min(1, "Glass ID is required"),
  sessionId: z.string().min(1, "Please select a session"),
});

type JoinFormData = z.infer<typeof joinSchema>;

export function JoinSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shotglasId = searchParams.get("shotglasId") || "";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionsResponse | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: getActiveSessions,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      hardwareId: shotglasId,
    },
  });

  const onSubmit = async (data: JoinFormData) => {
    setError("");

    startTransition(async () => {
      const result = await createPlayer({
        username: data.username,
        sessionId: data.sessionId,
        hardwareId: data.hardwareId,
      });

      if (result.success && result.player) {
        const session = sessions?.find((s) => s.id === data.sessionId) || null;
        setSelectedSession(session);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform animate-bounce-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            You&apos;re in!
          </h2>
          <p className="text-gray-600 mb-6">
            Redirecting to the leaderboard...
          </p>
          <div className="bg-yellow-100 rounded-2xl p-6 border-4 border-yellow-300">
            <p className="text-sm text-gray-500 mb-2">Your drinking session</p>
            <p className="text-2xl font-bold text-yellow-600">
              {selectedSession?.shortcode}
            </p>
          </div>
          <div className="mt-6">
            <div className="animate-spin text-4xl">⚡</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍻</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome to <span className="text-yellow-500">Slurp!</span>
          </h1>
          <p className="text-gray-600">
            Join the drinking session and let&apos;s get this party started!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Session Selection Dropdown */}
          <div>
            <label
              htmlFor="sessionId"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Select Session 🎯
            </label>
            {isLoading ? (
              <div className="px-4 py-3 border-3 border-yellow-300 rounded-2xl bg-yellow-50 text-gray-500 text-center">
                Loading sessions... 🔄
              </div>
            ) : sessions && sessions.length > 0 ? (
              <select
                id="sessionId"
                {...register("sessionId")}
                className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium bg-white"
              >
                <option value="">Choose a session...</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.shortcode}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 border-3 border-red-300 rounded-2xl bg-red-50 text-red-600 text-center">
                No active sessions available 😢
              </div>
            )}
            {errors.sessionId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.sessionId.message}
              </p>
            )}
          </div>

          {/* Hardware ID Field */}
          <div>
            <label
              htmlFor="hardwareId"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Glass ID 🥃
            </label>
            <input
              id="hardwareId"
              type="text"
              placeholder="Enter your glass ID"
              {...register("hardwareId")}
              className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium"
            />
            {errors.hardwareId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.hardwareId.message}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              Your Name 🎮
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your display name"
              {...register("username")}
              className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-3 border-red-300 rounded-2xl p-4 animate-shake">
              <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isPending || isLoading || !sessions || sessions.length === 0
            }
            className="w-full py-4 bg-linear-to-r from-yellow-400 to-yellow-500 text-white text-xl font-bold rounded-2xl hover:from-yellow-500 cursor-pointer hover:to-yellow-600 active:scale-95 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span> Joining...
              </span>
            ) : (
              "Join Session 🚀"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Select your session, enter your glass ID and name to join!
          </p>
        </div>
      </div>
    </div>
  );
}
