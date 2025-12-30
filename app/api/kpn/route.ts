import {
  Collections,
  Create,
  PlayersResponse,
  SessionsResponse,
  TypedPocketBase,
} from "@/pocketbase-types";
import { KPNBody } from "@/types/kpn";

import getPocketBase from "@/utils/getPocketBase";

function verifyKpnSecret(kpnBody: string, kpnSecret: string | undefined) {
  if (!kpnSecret) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(kpnBody + kpnSecret);
  return crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashString;
  });
}

class ProcessingError extends Error {}

async function processPayloadSegment(
  segment: Buffer<ArrayBuffer>,
  pb: TypedPocketBase,
  kpnPayloadTimestamp: Date
) {
  const glasId = segment.readUint16BE(0);
  const takenUnitCount = segment.readUint16BE(2);
  console.log(`ID: ${glasId}, Value: ${takenUnitCount}`);

  // Store in PocketBase
  const player = await pb
    .collection(Collections.Players)
    .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
      `hardware_id = "${glasId}" && session.active = true`,
      {
        expand: "session",
      }
    )
    .catch((e) => {
      throw new ProcessingError(
        `Failed to fetch player for hardware ID ${glasId}: ${e}`
      );
    });

  const referenceTime = new Date(player.machine_message_time);

  if (referenceTime >= kpnPayloadTimestamp) {
    throw new ProcessingError(
      `Stale message for player ${
        player.id
      }, message time ${kpnPayloadTimestamp.toISOString()} is not newer than last recorded time ${referenceTime.toISOString()}.`
    );
  }

  let referenceCount = player.machine_reference_count || 0;

  if (referenceCount > takenUnitCount) {
    // Hardware lost track of count, likely due to a restart, reset reference count
    console.log(
      `Adjusting taken count for player ${player.id} from ${referenceCount} to 0 due to restart.`
    );
    referenceCount = 0;
  }

  const changedByValue = takenUnitCount - referenceCount;

  if (changedByValue === 0) {
    throw new ProcessingError(
      `No change in unit count for player ${player.id}, skipping entry creation.`
    );
  }

  await pb.collection(Collections.Entries).create({
    units: -changedByValue,
    player: player.id,
    giveable: false,
    hide: false,
  } as Create<Collections.Entries>);

  // Update player's machine_reference_count
  await pb.collection(Collections.Players).update(player.id, {
    machine_reference_count: takenUnitCount,
    machine_message_time: kpnPayloadTimestamp.toISOString(),
  } as Create<Collections.Players>);

  console.log(
    `Processed entry for player ${player.id}: changed by ${changedByValue} units.`
  );
}

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const kpnBody: KPNBody = JSON.parse(textBody);
    const messageToken = req.headers.get("Things-Message-Token");
    const kpnSecret = process.env.KPN_SECRET;

    const kpnPayloadTimestamp = new Date(Math.floor(kpnBody[0].bt * 1000));

    const securityHash = await verifyKpnSecret(textBody, kpnSecret);

    if (securityHash !== messageToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("KPN Body:", kpnBody);

    if (kpnBody[0].n !== "payload") {
      // KPN sends payloads and join/location markers. We only care about payloads here.
      throw new Error("First object is not payload");
    }

    // Read payloadObject.vs as hex string into a UTF-8 buffer
    const payloadUtf8 = Buffer.from(kpnBody[0].vs, "hex");

    const pb = getPocketBase();

    const promises: Promise<void>[] = [];

    // Read per 4 bytes as two uint8 values (id, value)
    for (let i = 0; i < payloadUtf8.length; i += 4) {
      const segment = payloadUtf8.subarray(i, i + 4);
      promises.push(processPayloadSegment(segment, pb, kpnPayloadTimestamp));
    }

    return new Response(null, { status: 201 });
  } catch (error) {
    console.log("Discarded invalid KPN request", error);
  }

  return new Response("Bad Request", { status: 400 });
}
