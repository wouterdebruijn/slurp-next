import {
  Collections,
  Create,
  PlayersResponse,
  SessionsResponse,
} from "@/pocketbase-types";
import { KPNBody } from "@/types/kpn";

import pb from "@/utils/pocketbase";

export async function GET(req: Request) {
  try {
    const kpnBody: KPNBody = await req.json();
    console.log("KPN Body:", kpnBody);

    const payloadObject = kpnBody[0];

    // Read payloadObject.vs as hex string
    const payloadHex = payloadObject.vs;

    // Convert hex string to UTF-8 string
    const payloadUtf8 = Buffer.from(payloadHex, "hex");

    // Read per 4 bytes as two uint8 values (id, value)
    for (let i = 0; i < payloadUtf8.length; i += 4) {
      const id = payloadUtf8.readUInt8(i);
      const value = payloadUtf8.readUInt8(i + 1);
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
  } catch {
    console.log("Discarded invalid KPN request");
  }

  return new Response("OK", { status: 200 });
}
