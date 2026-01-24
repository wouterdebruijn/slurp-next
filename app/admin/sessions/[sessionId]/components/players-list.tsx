"use client";

import { useState, useEffect } from "react";
import { PlayersResponse } from "@/pocketbase-types";
import { getPlayerShotCount } from "@/app/actions/admin-actions";
import PlayerCard from "./player-card";

export default function PlayersList({
  initialPlayers,
}: {
  sessionId: string;
  initialPlayers: PlayersResponse[];
}) {
  const [players] = useState(initialPlayers);
  const [playerShots, setPlayerShots] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch shot counts for all players
    const fetchShotCounts = async () => {
      setLoading(true);
      const counts: Record<string, number> = {};

      await Promise.all(
        players.map(async (player) => {
          const result = await getPlayerShotCount(player.id);
          counts[player.id] = result.count;
        }),
      );

      setPlayerShots(counts);
      setLoading(false);
    };

    fetchShotCounts();
  }, [players]);

  const refreshPlayerShots = async (playerId: string) => {
    const result = await getPlayerShotCount(playerId);
    setPlayerShots((prev) => ({ ...prev, [playerId]: result.count }));
  };

  if (players.length === 0) {
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
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          shotCount={playerShots[player.id] || 0}
          loading={loading}
          onShotsUpdated={() => refreshPlayerShots(player.id)}
        />
      ))}
    </div>
  );
}
