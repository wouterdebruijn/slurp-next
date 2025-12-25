"use server";

import getPocketBase from "@/utils/getPocketBase";
import {
  SessionsResponse,
  PlayersResponse,
  Collections,
  Create,
} from "@/pocketbase-types";
import { revalidatePath } from "next/cache";

export async function getActiveSessions(): Promise<SessionsResponse[]> {
  try {
    const pb = getPocketBase();
    const sessions = await pb
      .collection("sessions")
      .getFullList<SessionsResponse>({
        filter: "active = true",
        sort: "-created",
      });
    return sessions;
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
}

export async function getSessionByShortcode(
  shortcode: string
): Promise<SessionsResponse | null> {
  try {
    const pb = getPocketBase();
    const session = await pb
      .collection("sessions")
      .getFirstListItem<SessionsResponse>(
        `shortcode = "${shortcode}" && active = true`
      );
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export async function getSessionByHardwareId(
  hardwareId: string
): Promise<SessionsResponse | null> {
  try {
    const pb = getPocketBase();
    // First, find a player with this hardware_id
    const player = await pb
      .collection(Collections.Players)
      .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
        `hardware_id = ${hardwareId}`,
        { expand: "session" }
      );

    if (player.expand?.session) {
      return player.expand.session as SessionsResponse;
    }
    return null;
  } catch (error) {
    console.error("Error fetching session by hardware ID:", error);
    return null;
  }
}

export async function getPlayerByHardwareId(
  hardwareId: string
): Promise<PlayersResponse | null> {
  try {
    const pb = getPocketBase();
    const player = await pb
      .collection(Collections.Players)
      .getFirstListItem<PlayersResponse>(
        `hardware_id = ${parseInt(hardwareId)}`
      );
    return player;
  } catch (error) {
    console.error("Error fetching player by hardware ID:", error);
    return null;
  }
}

interface CreatePlayerData {
  username: string;
  sessionId: string;
  hardwareId?: string;
}

export async function createPlayer(data: CreatePlayerData): Promise<{
  success: boolean;
  player?: PlayersResponse;
  error?: string;
}> {
  try {
    const pb = getPocketBase();

    // Check if session exists and is active
    const session = await pb
      .collection("sessions")
      .getOne<SessionsResponse>(data.sessionId);

    if (!session.active) {
      return {
        success: false,
        error: "This session is not active anymore",
      };
    }

    // Check if player with same username (case-insensitive) and hardware_id already exists
    if (data.hardwareId) {
      try {
        const existingPlayers = await pb
          .collection("players")
          .getFullList<PlayersResponse>({
            filter: `session = "${data.sessionId}" && hardware_id = ${parseInt(
              data.hardwareId
            )}`,
          });

        // Check for case-insensitive username match
        const existingPlayer = existingPlayers.find(
          (p) => p.username.toLowerCase() === data.username.toLowerCase()
        );

        if (existingPlayer) {
          // Return existing player instead of creating a new one
          revalidatePath("/");
          return {
            success: true,
            player: existingPlayer,
          };
        }
      } catch {
        // If no existing player found, continue to create new one
        console.log("No existing player found, creating new one");
      }
    }

    // Create the player
    const playerData: Create<Collections.Players> = {
      username: data.username,
      session: data.sessionId,
    };

    if (data.hardwareId) {
      playerData.hardware_id = parseInt(data.hardwareId);
    }

    const player = await pb
      .collection("players")
      .create<PlayersResponse>(playerData);

    revalidatePath("/");

    return {
      success: true,
      player,
    };
  } catch (error: unknown) {
    console.error("Error creating player:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
