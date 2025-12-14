import { NextResponse } from "next/server";
import { z } from "zod";

import getPocketBase from "@/utils/getPocketBase";
import { Collections } from "@/pocketbase-types";

const createPlayerSchema = z.object({
  sessionId: z.string().min(1),
  username: z.string().min(1).max(32),
  shotglassId: z.number().int().positive(),
});

function escapePocketBaseFilterString(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPlayerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const pb = getPocketBase();

  const escapedSessionId = escapePocketBaseFilterString(parsed.data.sessionId);
  const existingFilter = `session = "${escapedSessionId}" && hardware_id = ${parsed.data.shotglassId}`;

  try {
    const existingPlayer = await pb
      .collection(Collections.Players)
      .getFirstListItem(existingFilter);

    return NextResponse.json({
      player: {
        id: existingPlayer.id,
        sessionId: existingPlayer.session,
        username: existingPlayer.username,
        shotglassId: existingPlayer.hardware_id ?? parsed.data.shotglassId,
      },
      reused: true,
    });
  } catch {
    // Not found -> create below.
  }

  const player = await pb.collection(Collections.Players).create({
    session: parsed.data.sessionId,
    username: parsed.data.username,
    hardware_id: parsed.data.shotglassId,
  });

  return NextResponse.json({
    player: {
      id: player.id,
      sessionId: player.session,
      username: player.username,
      shotglassId: player.hardware_id ?? parsed.data.shotglassId,
    },
    reused: false,
  });
}
