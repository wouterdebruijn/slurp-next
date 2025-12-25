"use server";

import getPocketBase from "@/utils/getPocketBase";
import { EntriesRecord } from "@/pocketbase-types";

export interface PlayerEntry {
  playerId: string;
  username: string;
  timestamp: string;
  units: number;
}

export interface PlayerTimelineData {
  timestamp: string;
  [playerId: string]: number | string; // playerId -> cumulative shot count, timestamp is a string
}

export async function getPlayerEntries(sessionId: string): Promise<{
  timelineData: PlayerTimelineData[];
  playerNames: Record<string, string>;
}> {
  try {
    const pb = getPocketBase();
    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "10"
    );

    // Fetch all entries for the session with player expansion
    const entries = await pb.collection("entries").getFullList<
      EntriesRecord & {
        expand?: {
          player?: {
            id: string;
            username: string;
            session: string;
          };
        };
      }
    >({
      filter: `player.session = "${sessionId}" && hide != true && giveable != true && units < 0`,
      sort: "created",
      expand: "player",
    });

    // Build player names map
    const playerNames: Record<string, string> = {};
    const playerCumulativeShots: Record<string, number> = {};

    // Process entries to create timeline data
    const timelineMap = new Map<string, Record<string, number>>();

    entries.forEach((entry) => {
      if (!entry.expand?.player) return;

      const playerId = entry.expand.player.id;
      const username = entry.expand.player.username;
      const timestamp = new Date(entry.created).toISOString();
      const shots = Math.abs(entry.units) / shotUnitCount;

      // Store player name
      playerNames[playerId] = username;

      // Update cumulative shots for this player
      if (!playerCumulativeShots[playerId]) {
        playerCumulativeShots[playerId] = 0;
      }
      playerCumulativeShots[playerId] += shots;

      // Create or update timeline entry
      if (!timelineMap.has(timestamp)) {
        // Copy previous cumulative values
        const previousEntries = Array.from(timelineMap.entries());
        const lastEntry =
          previousEntries.length > 0
            ? previousEntries[previousEntries.length - 1][1]
            : {};

        timelineMap.set(timestamp, { ...lastEntry });
      }

      const timelineEntry = timelineMap.get(timestamp)!;
      timelineEntry[playerId] = playerCumulativeShots[playerId];

      // Update all subsequent entries with the new cumulative value
      let foundCurrent = false;
      for (const [ts, data] of Array.from(timelineMap.entries())) {
        if (foundCurrent) {
          data[playerId] = playerCumulativeShots[playerId];
        }
        if (ts === timestamp) {
          foundCurrent = true;
        }
      }
    });

    // Convert map to array
    const timelineData: PlayerTimelineData[] = Array.from(
      timelineMap.entries()
    ).map(([timestamp, data]) => ({
      timestamp,
      ...data,
    }));

    return {
      timelineData,
      playerNames,
    };
  } catch (error) {
    console.error("Error fetching player entries:", error);
    return {
      timelineData: [],
      playerNames: {},
    };
  }
}
