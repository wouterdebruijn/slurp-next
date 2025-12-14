import { TypedPocketBase } from "@/pocketbase-types";
import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL
) as TypedPocketBase;

export default pb;
