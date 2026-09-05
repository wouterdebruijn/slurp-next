import { KPNBody } from "@/types/kpn";
import { processPayloadSegment } from "@/utils/processPayloadSegment";

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

    const result = await Promise.allSettled(promises);
    result.forEach((res) => {
      if (res.status === "rejected") {
        console.log("Error processing segment:", res.reason);
      }
    });

    return new Response(null, { status: 201 });
  } catch (error) {
    console.log("Discarded invalid KPN request", error);
  }

  return new Response("Bad Request", { status: 400 });
}
