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
    <div className="flex flex-col items-center justify-center min-h-screen p-0 sm:p-6 xl:p-12">
      <div className="bg-transparent rounded-none p-4 sm:p-8 xl:p-12 max-w-[95vw] w-full min-h-screen sm:min-h-0">
        <LeaderboardHeader sessionShortcode={session.shortcode} />

        {currentPlayer && (
          <CurrentPlayerStats
            rank={currentPlayer.rank}
            totalShots={currentPlayer.totalShots}
          />
        )}

        {/* Landscape Layout: Side-by-side for TV/wide screens */}
        <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">
          {/* Leaderboard Section */}
          <div className="lg:flex-1 xl:flex-[1] lg:min-w-0">
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
          </div>

          {/* Graph Section */}
          <div className="lg:flex-1 xl:flex-[2] lg:min-w-0">
            <PlayerTimelineGraph
              sessionId={sessionId}
              topThreePlayers={topThreePlayers}
            />
          </div>
        </div>

        <LeaderboardActions onRefresh={() => refetch()} />
      </div>
    </div>
  );
}
