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
  const playerId = url.searchParams.get("player");

  if (!playerId) {
    return NextResponse.json({ error: "Missing player" }, { status: 400 });
  }

  const pb = getPocketBase();
  const shotUnitCount = getShotUnitCount();

  const player = await pb.collection(Collections.Players).getOne(playerId);

  const entries = await pb.collection(Collections.Entries).getFullList({
    filter: `player = "${playerId}" && units < 0 && giveable != true && hide != true`,
    sort: "updated",
  });

  const points = entries.map((e) => ({
    updated: e.updated,
    units: e.units,
    shots: Math.abs(e.units) / shotUnitCount,
  }));

  const totalShots = points.reduce((sum, p) => sum + p.shots, 0);

  return NextResponse.json({
    player: {
      id: player.id,
      username: player.username,
      sessionId: player.session,
      shotglassId: player.hardware_id ?? null,
    },
    points,
    totalShots,
    shotUnitCount,
  });
}
