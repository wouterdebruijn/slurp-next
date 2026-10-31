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
          className="px-6 py-3 bg-hex text-bone font-bold rounded-2xl hover:bg-hex/80 active:scale-95 transition-all glow-hex cursor-pointer"
        >
          🔮 Refresh Leaderboard
        </button>
      </div>

      {/* Back Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-mist font-medium hover:text-bone hover:underline cursor-pointer"
        >
          ⚰️ Back to the Crypt
        </button>
      </div>
    </>
  );
}
