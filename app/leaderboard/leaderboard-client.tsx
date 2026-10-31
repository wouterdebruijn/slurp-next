"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { SHOT_EVENT } from "@/app/components/halloween/motion";
import { getLeaderboardBySession } from "@/app/actions/leaderboard-actions";
import LeaderboardHeader from "./components/leaderboard-header";
import CurrentPlayerStats from "./components/current-player-stats";
import PlayerCard from "./components/player-card";
import EmptyLeaderboard from "./components/empty-leaderboard";
import LeaderboardActions from "./components/leaderboard-actions";
import LoadingState from "./components/loading-state";
import ErrorState from "./components/error-state";
import PlayerTimelineGraph from "./components/player-timeline-graph";
import NowPlaying from "./components/now-playing";

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

  // Let the decorations celebrate whenever someone takes a shot
  const totalShots = data?.players.reduce((sum, p) => sum + p.totalShots, 0);
  const previousTotal = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (totalShots === undefined) return;
    if (
      previousTotal.current !== undefined &&
      totalShots > previousTotal.current
    ) {
      window.dispatchEvent(new Event(SHOT_EVENT));
    }
    previousTotal.current = totalShots;
  }, [totalShots]);

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
            {/* Leaderboard Section: on wide screens the top 10 split the column height evenly.
                The padding leaves room for the card glow before the overflow clips it. */}
            <div className="lg:flex-1 xl:flex-[1] lg:min-w-0 lg:overflow-hidden lg:p-6 lg:-m-6">
              <div
                className={`space-y-3 mb-8 lg:mb-0 ${players.length > 0 ? "lg:h-full lg:grid lg:grid-rows-10 lg:gap-[1.2vh] lg:space-y-0 lg:[&>*:nth-child(n+11)]:hidden" : ""}`}
              >
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
            <div className="relative lg:flex-1 xl:flex-[2] lg:min-w-0 lg:flex lg:flex-col">
              {/* Above the graph on phones, tucked into its top-right corner on wide screens */}
              <NowPlaying className="mb-4 lg:mb-0 lg:absolute lg:z-10 lg:top-7 lg:right-6 xl:top-10 xl:right-10 short:top-6 short:right-6 lg:w-[min(24rem,45%)] xl:w-[min(25rem,35%)] short:w-[min(24rem,45%)]" />
              <PlayerTimelineGraph
                sessionId={sessionId}
                topThreePlayers={topThreePlayers}
              />
            </div>
          </div>
        </div>

        {/* The board auto-refreshes; on wide screens the buttons would only add a page scrollbar */}
        <div className="lg:hidden">
          <LeaderboardActions onRefresh={() => refetch()} />
        </div>
      </div>
    </div>
  );
}
