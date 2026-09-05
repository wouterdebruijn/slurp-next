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

type EntryWithPlayer = EntriesRecord & {
  expand?: {
    player?: {
      id: string;
      username: string;
      session: string;
    };
  };
};

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

    // Fetch every (visible) entry in chronological order. Entries are rendered
    // as they come: a negative entry is a shot taken (line goes up), a positive
    // entry is a correction bringing the count back down (line goes down).
    const entries = await pb.collection("entries").getFullList<EntryWithPlayer>({
      filter: `player.session = "${sessionId}" && hide != true`,
      sort: "created",
      expand: "player",
    });

    // Build player names map.
    const playerNames: Record<string, string> = {};
    entries.forEach((entry) => {
      if (!entry.expand?.player) return;
      playerNames[entry.expand.player.id] = entry.expand.player.username;
    });

    if (entries.length === 0) {
      return {
        timelineData: [],
        playerNames: {},
      };
    }

    // Track the most recent shot taken (negative units) for the praise banner.
    let lastPlayerEntry: { username: string; timestamp: string } | undefined;
    entries.forEach((entry) => {
      if (!entry.expand?.player || entry.units >= 0) return;
      if (
        !lastPlayerEntry ||
        new Date(entry.created) > new Date(lastPlayerEntry.timestamp)
      ) {
        lastPlayerEntry = {
          username: entry.expand.player.username,
          timestamp: entry.created,
        };
      }
    });

    // Only show the last 8 hours up to the most recent entry. Anything older is
    // folded into a starting baseline so lines begin at the right level.
    const latestTime = Math.max(
      ...entries.map((e) => new Date(e.created).getTime()),
    );
    const startTime = latestTime - 8 * 60 * 60 * 1000;

    // Running cumulative shot count per player. A negative entry pushes the line
    // up (shot taken); a positive entry pushes it back down (correction).
    const running: Record<string, number> = {};
    const applyEntry = (entry: EntryWithPlayer) => {
      if (!entry.expand?.player) return;
      const playerId = entry.expand.player.id;
      running[playerId] = (running[playerId] || 0) + -entry.units / shotUnitCount;
    };

    // Snapshot the current cumulative totals (rounded) for a timeline point.
    const snapshot = (): Record<string, number> => {
      const point: Record<string, number> = {};
      for (const playerId of Object.keys(running)) {
        point[playerId] = Math.round(running[playerId] * 10) / 10;
      }
      return point;
    };

    // Render one point per entry ("as they come") so intermediate peaks and the
    // dips from corrections are preserved rather than collapsed into buckets.
    const timelineData: PlayerTimelineData[] = [];
    let index = 0;

    // Fold pre-window entries into the baseline without emitting points.
    while (
      index < entries.length &&
      new Date(entries[index].created).getTime() < startTime
    ) {
      applyEntry(entries[index]);
      index++;
    }

    // Emit a baseline point so pre-window lines start at their carried-over value.
    if (Object.keys(running).length > 0) {
      timelineData.push({
        timestamp: new Date(startTime).toISOString(),
        ...snapshot(),
      });
    }

    // One point per in-window entry.
    for (; index < entries.length; index++) {
      applyEntry(entries[index]);
      timelineData.push({
        timestamp: entries[index].created,
        ...snapshot(),
      });
    }

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
