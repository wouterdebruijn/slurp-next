import { TypedPocketBase } from "@/pocketbase-types";
import PocketBase from "pocketbase";

export default function getPocketBase(): TypedPocketBase {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL
  ) as TypedPocketBase;

  if (!process.env.PB_TOKEN) {
    throw new Error("PB_TOKEN is not set in environment variables");
  }

  pb.authStore.save(process.env.PB_TOKEN, null);
  return pb;
}
