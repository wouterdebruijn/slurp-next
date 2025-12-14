import {
  Collections,
  Create,
  PlayersResponse,
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
    const kpnBody: KPNBody = await req.json();
    const messageToken = req.headers.get("Things-Message-Token");
    const kpnSecret = process.env.KPN_SECRET;

    const securityHash = await verifyKpnSecret(textBody, kpnSecret);

    if (securityHash !== messageToken) {
      console.log("Unauthorized KPN request", {
        expected: securityHash,
        received: messageToken,
      });
      // return new Response("Unauthorized", { status: 401 });
    }

    console.log("KPN Body:", kpnBody);

    const payloadObject = kpnBody[0];

    // Read payloadObject.vs as hex string
    const payloadHex = payloadObject.vs;

    // Convert hex string to UTF-8 string
    const payloadUtf8 = Buffer.from(payloadHex, "hex");

    const pb = getPocketBase();

    // Read per 4 bytes as two uint8 values (id, value)
    for (let i = 0; i < payloadUtf8.length; i += 4) {
      const id = payloadUtf8.readUint16BE(i);
      const value = payloadUtf8.readUint16BE(i + 2);
      console.log(`ID: ${id}, Value: ${value}`);

      // Store in PocketBase
      const player = await pb
        .collection(Collections.Players)
        .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
          `hardware_id = "${id}" && session.active = true`,
          {
            expand: "session",
          }
        );

      if (!player) {
        console.log(`No active session for hardware ID: ${id}`);
        continue;
      }

      await pb.collection(Collections.Entries).create({
        units: value,
        player: player.id,
        giveable: false,
        hide: false,
      } as Create<Collections.Entries>);

      console.log(`Created entry for player ${player.id} with units: ${value}`);
    }
  } catch (error) {
    console.log("Discarded invalid KPN request", error);
  }

  return new Response(null, { status: 201 });
}
