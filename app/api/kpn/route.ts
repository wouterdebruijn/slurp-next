import {
  Collections,
  Create,
  PlayersResponse,
  PlayersViewResponse,
  SessionsResponse,
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

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const kpnBody: KPNBody = JSON.parse(textBody);
    const messageToken = req.headers.get("Things-Message-Token");
    const kpnSecret = process.env.KPN_SECRET;

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

    // Read per 4 bytes as two uint8 values (id, value)
    for (let i = 0; i < payloadUtf8.length; i += 4) {
      try {
        const glasId = payloadUtf8.readUint16BE(i);
        const takenUnitCount = payloadUtf8.readUint16BE(i + 2);
        console.log(`ID: ${glasId}, Value: ${takenUnitCount}`);

        // Store in PocketBase
        const player = await pb
          .collection(Collections.Players)
          .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
            `hardware_id = "${glasId}" && session.active = true`,
            {
              expand: "session",
            }
          );

        if (!player) {
          console.log(`No active session for hardware ID: ${glasId}`);
          continue;
        }

        const playerStats = await pb
          .collection(Collections.PlayersView)
          .getFirstListItem<PlayersViewResponse>(
            `username = "${player.username}"`
          );

        const playerTakenCount = -(playerStats.taken as number);
        let referenceCount = player.machine_reference_count || 0;

        if (referenceCount > takenUnitCount) {
          // Hardware has been restarted and lost its count. Adjust accordingly.
          console.log(
            `Adjusting taken count for player ${player.id} from ${playerTakenCount} to ${referenceCount} due to restart.`
          );
          referenceCount = 0;
        }

        const changedByValue = takenUnitCount - referenceCount;

        await pb.collection(Collections.Entries).create({
          units: -changedByValue,
          player: player.id,
          giveable: false,
          hide: false,
        } as Create<Collections.Entries>);

        // Update player's machine_reference_count
        await pb.collection(Collections.Players).update(player.id, {
          machine_reference_count: takenUnitCount,
        } as Create<Collections.Players>);

        console.log(
          `Created entry for player ${player.id} with units: ${changedByValue}`
        );
      } catch (innerError) {
        console.log("Error processing payload segment:", innerError);
      }
    }
  } catch (error) {
    console.log("Discarded invalid KPN request", error);
  }

  return new Response(null, { status: 201 });
}
