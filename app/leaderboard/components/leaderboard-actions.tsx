"use client";

import { useRouter } from "next/navigation";

interface LeaderboardActionsProps {
  onRefresh: () => void;
}

export default function LeaderboardActions({
  onRefresh,
}: LeaderboardActionsProps) {
  const router = useRouter();

  return (
    <>
      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-yellow-400 text-white font-bold rounded-2xl hover:bg-yellow-500 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          🔄 Refresh Leaderboard
        </button>
      </div>

      {/* Back Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 font-medium hover:text-gray-800 hover:underline cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>
    </>
  );
}
