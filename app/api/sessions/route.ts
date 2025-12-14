import { NextResponse } from "next/server";

import getPocketBase from "@/utils/getPocketBase";
import { Collections } from "@/pocketbase-types";

export async function GET() {
  const pb = getPocketBase();

  const sessions = await pb.collection(Collections.Sessions).getFullList({
    filter: "active = true",
    sort: "-created",
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      shortcode: s.shortcode,
    })),
  });
}
