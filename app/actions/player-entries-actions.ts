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
  lastPlayer?: { username: string; timestamp: string };
}> {
  try {
    const pb = getPocketBase();
    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "20",
    );

    // Fetch shot entries for the timeline (actual shots taken by players)
    const shotEntries = await pb.collection("entries").getFullList<
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

    // Fetch all entries (including adjustments) for accurate cumulative calculations
    const allEntries = await pb.collection("entries").getFullList<
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
      filter: `player.session = "${sessionId}" && giveable != true`,
      sort: "created",
      expand: "player",
    });

    // Build player names map and calculate actual cumulative shots (accounting for adjustments)
    const playerNames: Record<string, string> = {};
    const playerCumulativeUnits: Record<string, number> = {};

    // First, calculate the actual cumulative units for each player (including adjustments)
    allEntries.forEach((entry) => {
      if (!entry.expand?.player) return;
      const playerId = entry.expand.player.id;
      const username = entry.expand.player.username;

      playerNames[playerId] = username;
      if (!playerCumulativeUnits[playerId]) {
        playerCumulativeUnits[playerId] = 0;
      }
      // Add all units (negative for shots, positive for adjustments)
      playerCumulativeUnits[playerId] += entry.units;
    });

    // Track last player entry (from actual shots only)
    let lastPlayerEntry: { username: string; timestamp: string } | undefined;

    // Find earliest and latest entry times (from actual shots only)
    let earliestTime: number | undefined = undefined;
    let latestTime: number | undefined = undefined;

    shotEntries.forEach((entry) => {
      const entryTime = new Date(entry.created).getTime();
      if (!earliestTime || entryTime < earliestTime) {
        earliestTime = entryTime;
      }
      if (!latestTime || entryTime > latestTime) {
        latestTime = entryTime;
      }
    });

    // If no entries, return empty
    if (!earliestTime || !latestTime) {
      return {
        timelineData: [],
        playerNames: {},
      };
    }

    // Calculate 8 hours ago from the latest entry
    const eightHoursBeforeLatest = new Date(latestTime - 8 * 60 * 60 * 1000);

    // Use the later of (earliest entry time or 8 hours before latest)
    const startTime = new Date(
      Math.max(earliestTime, eightHoursBeforeLatest.getTime()),
    );

    // Round down to nearest 10-minute bucket
    startTime.setMinutes(Math.floor(startTime.getMinutes() / 10) * 10);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    // Round up latest time to nearest 10-minute bucket
    const endTime = new Date(latestTime);
    endTime.setMinutes(Math.ceil(endTime.getMinutes() / 10) * 10);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    // Create 10-minute buckets from start time to end time (last entry)
    const buckets: Map<string, Record<string, number>> = new Map();
    let currentBucket = new Date(startTime);

    while (currentBucket <= endTime) {
      buckets.set(currentBucket.toISOString(), {});
      currentBucket = new Date(currentBucket.getTime() + 10 * 60 * 1000); // Add 10 minutes
    }

    // Track cumulative shots at each point in time for the timeline
    const playerTimelineShots: Record<string, number> = {};

    // Initialize with the baseline from all entries (including adjustments from before the window)
    Object.keys(playerCumulativeUnits).forEach((playerId) => {
      // Calculate shots from total units
      playerTimelineShots[playerId] = Math.floor(
        Math.abs(playerCumulativeUnits[playerId]) / shotUnitCount,
      );
    });

    // Subtract the shots that will be added during the timeline window
    shotEntries.forEach((entry) => {
      if (!entry.expand?.player) return;
      const playerId = entry.expand.player.id;
      const entryTime = new Date(entry.created);

      // If this entry is within the timeline window, we'll add it progressively
      if (entryTime >= startTime) {
        const shots = Math.abs(entry.units) / shotUnitCount;
        playerTimelineShots[playerId] =
          (playerTimelineShots[playerId] || 0) - shots;
      }
    });

    // Process shot entries and aggregate into 10-minute buckets
    shotEntries.forEach((entry) => {
      if (!entry.expand?.player) return;

      const playerId = entry.expand.player.id;
      const username = entry.expand.player.username;
      const entryTime = new Date(entry.created);
      const shots = Math.abs(entry.units) / shotUnitCount;

      // Track the last (most recent) player entry
      if (!lastPlayerEntry || entryTime > new Date(lastPlayerEntry.timestamp)) {
        lastPlayerEntry = {
          username,
          timestamp: entry.created,
        };
      }

      // Skip entries older than our start time (outside 8-hour window from last entry)
      if (entryTime < startTime) {
        return;
      }

      // Update cumulative shots for this player in the timeline
      if (!playerTimelineShots[playerId]) {
        playerTimelineShots[playerId] = 0;
      }
      playerTimelineShots[playerId] += shots;

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
          data[playerId] = playerTimelineShots[playerId];
        }
      }
    });

    // Convert map to array
    const timelineData: PlayerTimelineData[] = Array.from(
      buckets.entries(),
    ).map(([timestamp, data]) => ({
      timestamp,
      ...data,
    }));

    return {
      timelineData,
      playerNames,
      lastPlayer: lastPlayerEntry,
    };
  } catch (error) {
    console.error("Error fetching player entries:", error);
    return {
      timelineData: [],
      playerNames: {},
    };
  }
}
