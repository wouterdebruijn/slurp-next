import {
  Collections,
  Create,
  PlayersResponse,
  SessionsResponse,
  TypedPocketBase,
} from "@/pocketbase-types";
import { sendDiscordMessage } from "@/utils/discord";
import getPocketBase from "@/utils/getPocketBase";

class ProcessingError extends Error {}

async function processPayloadSegment(
  segment: Buffer,
  pb: TypedPocketBase,
  timestamp: Date
) {
  const glasId = segment.readUint16BE(0);
  const takenUnitCount = segment.readUint16BE(2);
  console.log(`Device segment — ID: ${glasId}, Value: ${takenUnitCount}`);

  const player = await pb
    .collection(Collections.Players)
    .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
      `hardware_id = "${glasId}" && session.active = true`,
      { expand: "session" }
    )
    .catch((e) => {
      throw new ProcessingError(
        `Failed to fetch player for hardware ID ${glasId}: ${e}`
      );
    });

  const referenceTime = new Date(player.machine_message_time);

  if (referenceTime >= timestamp) {
    throw new ProcessingError(
      `Stale message for player ${player.id}, message time ${timestamp.toISOString()} is not newer than last recorded time ${referenceTime.toISOString()}.`
    );
  }

  let referenceCount = player.machine_reference_count || 0;

  if (referenceCount > takenUnitCount) {
    // Device restarted and lost its running count — reset reference
    console.log(
      `Adjusting count for player ${player.id} from ${referenceCount} to 0 due to device restart.`
    );
    referenceCount = 0;
  }

  const changedByValue = takenUnitCount - referenceCount;

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
    machine_reference_count: takenUnitCount,
    machine_message_time: timestamp.toISOString(),
  } as Create<Collections.Players>);

  console.log(
    `Processed segment for player ${player.id}: changed by ${changedByValue} units.`
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

  // The device sends the same raw binary payload as decoded from the LoRa/KPN
  // uplink: a sequence of 4-byte segments (uint16BE id, uint16BE count).
  const payload = Buffer.from(await req.arrayBuffer());

  if (payload.length === 0 || payload.length % 4 !== 0) {
    return new Response("Bad Request: invalid payload length", { status: 400 });
  }

  console.log(`Device payload (${payload.length} bytes)`);

  const pb = getPocketBase();
  const timestamp = new Date();

  const promises: Promise<void>[] = [];

  // Read per 4 bytes as two uint16 values (id, count)
  for (let i = 0; i < payload.length; i += 4) {
    const segment = payload.subarray(i, i + 4);
    promises.push(processPayloadSegment(segment, pb, timestamp));
  }

  const results = await Promise.allSettled(promises);
  results.forEach((res) => {
    if (res.status === "rejected") {
      console.log("Error processing segment:", res.reason);
      sendDiscordMessage(
        "Slurp device payload processing error",
        `Error: ${res.reason}`
      );
    }
  });

  return new Response(null, { status: 201 });
}
