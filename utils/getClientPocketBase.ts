import PocketBase from "pocketbase";
import { TypedPocketBase } from "@/pocketbase-types";

let pbInstance: TypedPocketBase | null = null;

export function getClientPocketBase(): TypedPocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(
      process.env.NEXT_PUBLIC_POCKETBASE_URL
    ) as TypedPocketBase;
  }
  return pbInstance;
}
