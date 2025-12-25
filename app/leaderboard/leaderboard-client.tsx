"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboardBySession } from "@/app/actions/leaderboard-actions";
import LeaderboardHeader from "./components/leaderboard-header";
import CurrentPlayerStats from "./components/current-player-stats";
import PlayerCard from "./components/player-card";
import EmptyLeaderboard from "./components/empty-leaderboard";
import LeaderboardActions from "./components/leaderboard-actions";
import LoadingState from "./components/loading-state";
import ErrorState from "./components/error-state";
import PlayerTimelineGraph from "./components/player-timeline-graph";

interface LeaderboardClientProps {
  sessionId: string;
  playerId?: string;
}

export default function LeaderboardClient({
  sessionId,
  playerId,
}: LeaderboardClientProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboard", sessionId],
    queryFn: () => getLeaderboardBySession(sessionId),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !data?.session) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const { players, session } = data;
  const currentPlayer = players.find((p) => p.id === playerId);

  const topThreePlayers = players
    .filter((p) => p.rank <= 3)
    .map((p) => ({ id: p.id, rank: p.rank }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-yellow-300 via-yellow-400 to-orange-400 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <LeaderboardHeader sessionShortcode={session.shortcode} />

        {currentPlayer && (
          <CurrentPlayerStats
            rank={currentPlayer.rank}
            totalShots={currentPlayer.totalShots}
          />
        )}

        <div className="space-y-3 mb-8">
          {players.length === 0 ? (
            <EmptyLeaderboard />
          ) : (
            players.map((player, index) => (
              <PlayerCard
                key={player.id}
                rank={player.rank}
                username={player.username}
                totalShots={player.totalShots}
                isCurrentPlayer={player.id === playerId}
                index={index}
              />
            ))
          )}
        </div>

        <PlayerTimelineGraph
          sessionId={sessionId}
          topThreePlayers={topThreePlayers}
        />

        <LeaderboardActions onRefresh={() => refetch()} />
      </div>
    </div>
  );
}
