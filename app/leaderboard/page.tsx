"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboardBySession } from "@/app/actions/leaderboard-actions";
import { useSearchParams, useRouter } from "next/navigation";

const RANK_EMOJIS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const RANK_COLORS = {
  1: "from-yellow-400 to-yellow-500",
  2: "from-gray-300 to-gray-400",
  3: "from-orange-400 to-orange-500",
};

const RANK_BORDER = {
  1: "border-yellow-400",
  2: "border-gray-400",
  3: "border-orange-400",
};

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");
  const playerId = searchParams.get("player");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboard", sessionId],
    queryFn: () => getLeaderboardBySession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Session Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please join a session first to view the leaderboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-linear-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-2xl hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transition-all"
          >
            Join Session
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400">
        <div className="text-6xl mb-4 animate-spin">🍺</div>
        <p className="text-white text-xl font-bold">Loading leaderboard...</p>
      </div>
    );
  }

  if (error || !data?.session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t load the leaderboard. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-linear-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-2xl hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { players, session } = data;
  const currentPlayer = players.find((p) => p.id === playerId);

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Leaderboard
          </h1>
          <div className="bg-white/90 backdrop-blur rounded-2xl px-6 py-3 inline-block">
            <p className="text-sm text-gray-600 mb-1">Session</p>
            <p className="text-2xl font-bold text-yellow-600">
              {session.shortcode}
            </p>
          </div>
        </div>

        {/* Current Player Highlight */}
        {currentPlayer && (
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-6 border-4 border-green-400 animate-slide-in">
            <p className="text-sm text-gray-600 mb-1 text-center">Your Stats</p>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  #{currentPlayer.rank}
                </p>
                <p className="text-xs text-gray-600">Rank</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {currentPlayer.totalShots}
                </p>
                <p className="text-xs text-gray-600">Total Shots</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
              <div className="text-4xl mb-4">🤷</div>
              <p className="text-gray-600">
                No players yet. Be the first to join!
              </p>
            </div>
          ) : (
            players.map((player, index) => {
              const isTop3 = player.rank <= 3;
              const isCurrentPlayer = player.id === playerId;
              const rankEmoji =
                RANK_EMOJIS[player.rank as keyof typeof RANK_EMOJIS];
              const rankColor =
                RANK_COLORS[player.rank as keyof typeof RANK_COLORS];
              const rankBorder =
                RANK_BORDER[player.rank as keyof typeof RANK_BORDER];

              return (
                <div
                  key={player.id}
                  className={`
                    relative overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl
                    ${
                      isTop3
                        ? `bg-linear-to-r ${rankColor} border-4 ${rankBorder}`
                        : "bg-white"
                    }
                    ${isCurrentPlayer ? "ring-4 ring-green-400" : ""}
                  `}
                  style={{
                    animation: `slide-in ${0.2 + index * 0.05}s ease-out`,
                  }}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div
                        className={`text-3xl font-bold ${
                          isTop3 ? "text-white" : "text-gray-700"
                        } min-w-15 text-center`}
                      >
                        {rankEmoji || `#${player.rank}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold ${
                            isTop3 ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {player.username}
                          {isCurrentPlayer && " (You)"}
                        </h3>
                      </div>

                      {/* Total Score */}
                      <div className="text-right">
                        <div
                          className={`text-3xl font-bold ${
                            isTop3 ? "text-white" : "text-yellow-600"
                          }`}
                        >
                          {player.totalShots}
                        </div>
                        <div
                          className={`text-xs ${
                            isTop3 ? "text-white/90" : "text-gray-600"
                          }`}
                        >
                          shots
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Sparkle Effect */}
                  {isTop3 && (
                    <div className="absolute top-2 right-2 text-2xl animate-pulse">
                      ✨
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-white text-yellow-600 font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            🔄 Refresh Leaderboard
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-white font-medium hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
