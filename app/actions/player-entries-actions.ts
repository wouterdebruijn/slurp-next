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

    // Find earliest entry to determine start time
    let earliestTime: Date | null = null;

    entries.forEach((entry) => {
      const entryTime = new Date(entry.created);
      if (!earliestTime || entryTime < earliestTime) {
        earliestTime = entryTime;
      }
    });

    // If no entries, return empty
    if (!earliestTime) {
      return {
        timelineData: [],
        playerNames: {},
      };
    }

    // Calculate 5 hours ago from now
    const now = new Date();
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    // Use the later of (earliest entry time or 5 hours ago)
    const startTime = earliestTime > fiveHoursAgo ? earliestTime : fiveHoursAgo;

    // Round down to nearest 10-minute bucket
    startTime.setMinutes(Math.floor(startTime.getMinutes() / 10) * 10);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    // Create 10-minute buckets from start time to now
    const buckets: Map<string, Record<string, number>> = new Map();
    let currentBucket = new Date(startTime);

    while (currentBucket <= now) {
      buckets.set(currentBucket.toISOString(), {});
      currentBucket = new Date(currentBucket.getTime() + 10 * 60 * 1000); // Add 10 minutes
    }

    // Process entries and aggregate into 10-minute buckets
    entries.forEach((entry) => {
      if (!entry.expand?.player) return;

      const playerId = entry.expand.player.id;
      const username = entry.expand.player.username;
      const entryTime = new Date(entry.created);
      const shots = Math.abs(entry.units) / shotUnitCount;

      // Skip entries older than our start time (outside 5-hour window)
      if (entryTime < startTime) {
        // Still count these shots in cumulative total but don't show them on graph
        playerNames[playerId] = username;
        if (!playerCumulativeShots[playerId]) {
          playerCumulativeShots[playerId] = 0;
        }
        playerCumulativeShots[playerId] += shots;
        return;
      }

      // Store player name
      playerNames[playerId] = username;

      // Update cumulative shots for this player
      if (!playerCumulativeShots[playerId]) {
        playerCumulativeShots[playerId] = 0;
      }
      playerCumulativeShots[playerId] += shots;

      // Find the 10-minute bucket this entry belongs to
      const bucketTime = new Date(entryTime);
      bucketTime.setMinutes(Math.floor(bucketTime.getMinutes() / 10) * 10);
      bucketTime.setSeconds(0);
      bucketTime.setMilliseconds(0);
      const bucketKey = bucketTime.toISOString();

      // Update this bucket and all subsequent buckets with the cumulative value
      let foundBucket = false;
      for (const [bucketTimestamp, data] of Array.from(buckets.entries())) {
        if (bucketTimestamp === bucketKey) {
          foundBucket = true;
        }
        if (foundBucket) {
          data[playerId] = playerCumulativeShots[playerId];
        }
      }
    });

    // Convert map to array
    const timelineData: PlayerTimelineData[] = Array.from(
      buckets.entries()
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
