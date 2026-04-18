import {
  Collections,
  Create,
  PlayersResponse,
  SessionsResponse,
  TypedPocketBase,
} from "@/pocketbase-types";
import { sendDiscordMessage } from "@/utils/discord";
import getPocketBase from "@/utils/getPocketBase";

interface DeviceTag {
  id: number;
  count: number;
}

interface DevicePayload {
  device: string;
  tags: DeviceTag[];
}

class ProcessingError extends Error {}

async function processTag(
  tag: DeviceTag,
  pb: TypedPocketBase,
  timestamp: Date
) {
  console.log(`Device tag — ID: ${tag.id}, Count: ${tag.count}`);

  const player = await pb
    .collection(Collections.Players)
    .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
      `hardware_id = "${tag.id}" && session.active = true`,
      { expand: "session" }
    )
    .catch((e) => {
      throw new ProcessingError(
        `Failed to fetch player for hardware ID ${tag.id}: ${e}`
      );
    });

  const referenceTime = new Date(player.machine_message_time);

  if (referenceTime >= timestamp) {
    throw new ProcessingError(
      `Stale message for player ${player.id}, message time ${timestamp.toISOString()} is not newer than last recorded time ${referenceTime.toISOString()}.`
    );
  }

  let referenceCount = player.machine_reference_count || 0;

  if (referenceCount > tag.count) {
    // Device restarted and lost its running count — reset reference
    console.log(
      `Adjusting count for player ${player.id} from ${referenceCount} to 0 due to device restart.`
    );
    referenceCount = 0;
  }

  const changedByValue = tag.count - referenceCount;

  if (changedByValue === 0) {
    throw new ProcessingError(
      `No change in unit count for player ${player.id}, skipping.`
    );
  }

  await pb.collection(Collections.Entries).create({
    units: -changedByValue,
    player: player.id,
    giveable: false,
    hide: false,
  } as Create<Collections.Entries>);

  await pb.collection(Collections.Players).update(player.id, {
    machine_reference_count: tag.count,
    machine_message_time: timestamp.toISOString(),
  } as Create<Collections.Players>);

  console.log(
    `Processed tag for player ${player.id}: changed by ${changedByValue} units.`
  );
}

export async function POST(req: Request) {
  // Shared-secret bearer token authentication
  const authHeader = req.headers.get("Authorization");
  const deviceSecret = process.env.DEVICE_SECRET;

  if (!deviceSecret) {
    console.error("DEVICE_SECRET environment variable is not set");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (authHeader !== `Bearer ${deviceSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: DevicePayload;

  try {
    payload = await req.json();
  } catch {
    return new Response("Bad Request: invalid JSON", { status: 400 });
  }

  if (
    !payload.device ||
    !Array.isArray(payload.tags) ||
    payload.tags.length === 0
  ) {
    return new Response("Bad Request: missing device or tags", { status: 400 });
  }

  console.log(`Device payload from ${payload.device}:`, payload.tags);

  const pb = getPocketBase();
  const timestamp = new Date();

  const promises = payload.tags.map((tag) => processTag(tag, pb, timestamp));

  const results = await Promise.allSettled(promises);
  results.forEach((res) => {
    if (res.status === "rejected") {
      console.log("Error processing tag:", res.reason);
      sendDiscordMessage(
        "Slurp device payload processing error",
        `Device: ${payload.device}\nError: ${res.reason}`
      );
    }
  });

  return new Response(null, { status: 201 });
}
