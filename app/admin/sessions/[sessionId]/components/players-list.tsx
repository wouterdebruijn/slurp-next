"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayersResponse } from "@/pocketbase-types";
import { getPlayerShotCount } from "@/app/actions/admin-actions";
import PlayerCard from "./player-card";

export default function PlayersList({
  sessionId,
  initialPlayers,
}: {
  sessionId: string;
  initialPlayers: PlayersResponse[];
}) {
  const queryClient = useQueryClient();

  const { data: shotCounts = {} } = useQuery({
    queryKey: ["playerShotCounts", sessionId],
    queryFn: async () => {
      const entries = await Promise.all(
        initialPlayers.map((p) =>
          getPlayerShotCount(p.id).then((r) => [p.id, r.count] as const),
        ),
      );
      return Object.fromEntries(entries);
    },
    staleTime: 10_000,
  });

  const handleShotsUpdated = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ["playerShotCounts", sessionId],
      }),
    [queryClient, sessionId],
  );

  if (initialPlayers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">
          No players in this session yet. Players will appear here once they
          join.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {initialPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          shotCount={shotCounts[player.id]}
          onShotsUpdated={handleShotsUpdated}
        />
      ))}
    </div>
  );
}
