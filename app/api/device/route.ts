import { processPayloadSegment } from "@/utils/processPayloadSegment";
import getPocketBase from "@/utils/getPocketBase";

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
    }
  });

  return new Response(null, { status: 201 });
}
