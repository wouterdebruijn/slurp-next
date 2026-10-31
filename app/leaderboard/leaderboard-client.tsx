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
    refetchInterval: 5000, // Refetch every 5 seconds
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
    <div className="flex flex-col items-center justify-center min-h-screen p-0 sm:p-6 lg:py-0 xl:px-12">
      <div className="bg-transparent rounded-none p-4 sm:p-8 lg:py-0 xl:px-12 max-w-[95vw] w-full min-h-screen sm:min-h-0">
        {/* On wide screens the header, list and graph fill exactly one screen */}
        <div className="lg:h-screen lg:flex lg:flex-col lg:py-6 xl:py-10">
          <LeaderboardHeader
            sessionId={session.id}
            sessionShortcode={session.shortcode}
            isSessionActive={!!session.active}
          />

          {currentPlayer && (
            <CurrentPlayerStats
              rank={currentPlayer.rank}
              totalShots={currentPlayer.totalShots}
            />
          )}

          {/* Landscape Layout: Side-by-side for TV/wide screens */}
          <div className="flex flex-col lg:flex-row lg:gap-6 lg:flex-1 lg:min-h-0">
            {/* Leaderboard Section: scrolls inside its column, fading out at the bottom */}
            <div className="lg:flex-1 xl:flex-[1] lg:min-w-0 lg:overflow-y-auto lg:p-2 lg:-m-2 [scrollbar-width:none] lg:[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]">
              <div className="space-y-3 mb-8 lg:mb-0 lg:pb-12">
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
                      hardwareId={player.hardwareId}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Graph Section */}
            <div className="lg:flex-1 xl:flex-[2] lg:min-w-0 lg:flex lg:flex-col">
              <PlayerTimelineGraph
                sessionId={sessionId}
                topThreePlayers={topThreePlayers}
              />
            </div>
          </div>
        </div>

        <LeaderboardActions onRefresh={() => refetch()} />
      </div>
    </div>
  );
}
