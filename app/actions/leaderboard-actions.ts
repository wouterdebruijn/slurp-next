"use server";

import getPocketBase from "@/utils/getPocketBase";
import {
  EntriesResponse,
  PlayersResponse,
  PlayersViewResponse,
  SessionsResponse,
} from "@/pocketbase-types";

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
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "20",
    );

    // Get session info
    const session = await pb
      .collection("sessions")
      .getOne<SessionsResponse>(sessionId);

    // Get all players in the session
    const players = await pb
      .collection("players")
      .getFullList<PlayersResponse>({
        filter: `session = "${sessionId}"`,
        sort: "username",
      });

    // Get every (visible) entry for the session so we can sum them.
    // A negative entry is a shot taken; a positive entry is a correction that
    // brings the count back down. Summing everything reflects both directions.
    const entries = await pb.collection("entries").getFullList<EntriesResponse>({
      filter: `player.session = "${sessionId}" && hide != true`,
    });

    // Sum the raw units per player.
    const unitsByPlayer = new Map<string, number>();
    entries.forEach((entry) => {
      unitsByPlayer.set(
        entry.player,
        (unitsByPlayer.get(entry.player) || 0) + entry.units,
      );
    });

    const leaderboardPlayers: LeaderboardPlayer[] = players.map((player) => {
      // Units are negative for shots taken, so negate to get a shot count.
      const totalUnits = unitsByPlayer.get(player.id) || 0;
      const totalShots = -totalUnits / shotUnitCount;

      return {
        id: player.id,
        username: player.username,
        totalShots: Math.round(totalShots * 10) / 10, // Round to 1 decimal place
        rank: 0, // Will be set after sorting
        hardwareId: player.hardware_id,
      };
    });

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
