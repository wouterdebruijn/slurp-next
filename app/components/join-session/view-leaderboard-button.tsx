"use client";

import { useRouter } from "next/navigation";

interface Session {
  id: string;
  shortcode: string;
}

interface ViewLeaderboardButtonProps {
  selectedSession: Session | null;
  isLoading: boolean;
  sessions?: Session[];
}

export function ViewLeaderboardButton({
  selectedSession,
  isLoading,
  sessions,
}: ViewLeaderboardButtonProps) {
  const router = useRouter();

  if (!selectedSession) return null;

  return (
    <button
      type="button"
      onClick={() => router.push(`/leaderboard?session=${selectedSession.id}`)}
      disabled={isLoading || !sessions || sessions.length === 0}
      className="w-full py-3 bg-white border-3 border-yellow-400 text-yellow-600 text-lg font-bold rounded-2xl hover:bg-yellow-50 active:scale-95 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer"
    >
      👀 View Leaderboard Only
    </button>
  );
}
