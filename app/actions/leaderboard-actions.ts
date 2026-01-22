"use server";

import getPocketBase from "@/utils/getPocketBase";
import { PlayersViewResponse, SessionsResponse } from "@/pocketbase-types";

export interface LeaderboardPlayer {
  id: string;
  username: string;
  totalShots: number;
  rank: number;
  hardwareId?: number;
}

export async function getLeaderboardBySession(sessionId: string): Promise<{
  players: LeaderboardPlayer[];
  session: SessionsResponse | null;
}> {
  try {
    const pb = getPocketBase();
    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "10",
    );

    // Get session info
    const session = await pb
      .collection("sessions")
      .getOne<SessionsResponse>(sessionId);

    // Get all players from players_view collection with player expansion to get hardware_id
    const playersView = await pb
      .collection("players_view")
      .getFullList<PlayersViewResponse>({
        filter: `session = "${sessionId}"`,
        sort: "username",
      });

    // Get hardware_id from players collection
    const playerIds = playersView.map((p) => p.id);
    const playersData = await pb
      .collection("players")
      .getFullList<{ id: string; hardware_id?: number }>({
        filter: playerIds.map((id) => `id = "${id}"`).join(" || "),
      });

    // Create a map of player id to hardware_id
    const hardwareIdMap = new Map<string, number | undefined>();
    playersData.forEach((p) => {
      hardwareIdMap.set(p.id, p.hardware_id);
    });

    // Calculate shots for each player from taken stat
    const leaderboardPlayers: LeaderboardPlayer[] = playersView.map(
      (player) => {
        // taken is stored as negative, so invert it and divide by SHOT_UNIT_COUNT
        const takenValue = typeof player.taken === "number" ? player.taken : 0;
        const totalShots = Math.abs(takenValue) / shotUnitCount;

        // Get hardware_id from the map
        const hardwareId = hardwareIdMap.get(player.id);

        return {
          id: player.id,
          username: player.username,
          totalShots: Math.round(totalShots * 10) / 10, // Round to 1 decimal place
          rank: 0, // Will be set after sorting
          hardwareId,
        };
      },
    );

    // Sort by total shots (descending) and assign ranks
    leaderboardPlayers.sort((a, b) => b.totalShots - a.totalShots);
    leaderboardPlayers.forEach((player, index) => {
      player.rank = index + 1;
    });

    return {
      players: leaderboardPlayers,
      session,
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      players: [],
      session: null,
    };
  }
}

export async function getPlayerSession(
  playerId: string,
): Promise<string | null> {
  try {
    const pb = getPocketBase();
    const player = await pb
      .collection("players_view")
      .getOne<PlayersViewResponse>(playerId);
    return player.session;
  } catch (error) {
    console.error("Error fetching player session:", error);
    return null;
  }
}
