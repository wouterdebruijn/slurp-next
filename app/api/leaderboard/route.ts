import { NextResponse } from "next/server";

import getPocketBase from "@/utils/getPocketBase";
import { Collections } from "@/pocketbase-types";

function getShotUnitCount() {
  const raw = process.env.SHOT_UNIT_COUNT;
  const value = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("SHOT_UNIT_COUNT is not set or invalid");
  }
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  const pb = getPocketBase();
  const shotUnitCount = getShotUnitCount();

  const rows = await pb.collection(Collections.PlayersView).getFullList({
    filter: `session = "${sessionId}"`,
  });

  const players = rows
    .map((r) => {
      const takenUnits = Math.abs(Number(r.taken ?? 0));
      return {
        id: r.id,
        username: r.username,
        shotsTaken: takenUnits / shotUnitCount,
      };
    })
    .sort((a, b) => b.shotsTaken - a.shotsTaken);

  return NextResponse.json({ sessionId, players, shotUnitCount });
}
