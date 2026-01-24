"use server";

import {
  SessionsResponse,
  PlayersResponse,
  EntriesResponse,
} from "@/pocketbase-types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";

const ADMIN_COOKIE_NAME = "pb_admin_auth";

/**
 * Authenticate a superuser admin
 */
export async function adminLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    const authData = await pb
      .collection("_superusers")
      .authWithPassword(email, password);

    if (!authData || !authData.token) {
      return { success: false, error: "Invalid credentials" };
    }

    // Store the admin token in a secure cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Log out an admin
 */
export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Verify if the current user is an authenticated admin
 */
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return false;
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    pb.authStore.save(token, null);

    // Verify the token is valid
    const isValid = pb.authStore.isValid;
    return isValid;
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}

/**
 * Get an authenticated PocketBase client for admin operations
 */
async function getAdminPocketBase(): Promise<PocketBase | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    pb.authStore.save(token, null);

    if (!pb.authStore.isValid) {
      return null;
    }

    return pb;
  } catch (error) {
    console.error("Error getting admin PocketBase:", error);
    return null;
  }
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<SessionsResponse[]> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      throw new Error("Not authenticated");
    }

    const sessions = await pb
      .collection("sessions")
      .getFullList<SessionsResponse>({
        sort: "-created",
      });

    return sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

/**
 * Create a new session
 */
export async function createSession(data: {
  shortcode: string;
  active?: boolean;
}): Promise<{ success: boolean; error?: string; session?: SessionsResponse }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await pb
      .collection("sessions")
      .create<SessionsResponse>(data);

    revalidatePath("/admin/sessions");
    return { success: true, session };
  } catch (error: unknown) {
    console.error("Error creating session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session",
    };
  }
}

/**
 * Update a session
 */
export async function updateSession(
  sessionId: string,
  data: {
    shortcode?: string;
    active?: boolean;
  },
): Promise<{ success: boolean; error?: string; session?: SessionsResponse }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    const session = await pb
      .collection("sessions")
      .update<SessionsResponse>(sessionId, data);

    revalidatePath("/admin/sessions");
    revalidatePath("/");
    return { success: true, session };
  } catch (error: unknown) {
    console.error("Error updating session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update session",
    };
  }
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    await pb.collection("sessions").delete(sessionId);

    revalidatePath("/admin/sessions");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete session",
    };
  }
}

/**
 * Get all players in a session
 */
export async function getSessionPlayers(
  sessionId: string,
): Promise<PlayersResponse[]> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      throw new Error("Not authenticated");
    }

    const players = await pb
      .collection("players")
      .getFullList<PlayersResponse>({
        filter: `session = "${sessionId}"`,
        sort: "username",
      });

    return players;
  } catch (error) {
    console.error("Error fetching session players:", error);
    return [];
  }
}

/**
 * Add shots to a player (create a negative entry)
 */
export async function addShotsToPlayer(
  playerId: string,
  shots: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "20",
    );

    // Create a negative entry (shots are stored as negative units, multiplied by shot unit count)
    await pb.collection("entries").create({
      player: playerId,
      units: -shots * shotUnitCount,
      hide: false,
      giveable: false,
    });

    revalidatePath("/admin/sessions");
    revalidatePath("/leaderboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error adding shots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add shots",
    };
  }
}

/**
 * Remove shots from a player (create a positive entry)
 */
export async function removeShotsFromPlayer(
  playerId: string,
  shots: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "20",
    );

    // Create a positive entry with hide=true for admin adjustment
    // This reduces the player's shot count without showing as a shot to take
    await pb.collection("entries").create({
      player: playerId,
      units: shots * shotUnitCount,
      hide: true,
      giveable: false,
    });

    revalidatePath("/admin/sessions");
    revalidatePath("/leaderboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error removing shots:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove shots",
    };
  }
}

/**
 * Get player's current shot count
 */
export async function getPlayerShotCount(
  playerId: string,
): Promise<{ count: number; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { count: 0, error: "Not authenticated" };
    }

    const shotUnitCount = parseInt(
      process.env.NEXT_PUBLIC_SHOT_UNIT_COUNT || "20",
    );

    // Get all entries (including hidden ones for adjustments)
    const entries = await pb
      .collection("entries")
      .getFullList<EntriesResponse>({
        filter: `player = "${playerId}" && giveable != true`,
      });

    // Calculate total shots:
    // - Negative units with hide=false: shots taken by player
    // - Positive units with hide=true: admin adjustments (reducing count)
    // Sum all units and take absolute value of the result
    const totalUnits = entries.reduce((sum, entry) => sum + entry.units, 0);
    const totalShots = Math.floor(Math.abs(totalUnits) / shotUnitCount);

    return { count: totalShots };
  } catch (error: unknown) {
    console.error("Error getting player shot count:", error);
    return {
      count: 0,
      error:
        error instanceof Error ? error.message : "Failed to get shot count",
    };
  }
}

/**
 * Get all entries for a session
 */
export async function getSessionEntries(sessionId: string) {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      throw new Error("Not authenticated");
    }

    const entries = await pb.collection("entries").getFullList<
      EntriesResponse & {
        expand?: {
          player?: {
            id: string;
            username: string;
            session: string;
          };
        };
      }
    >({
      filter: `player.session = "${sessionId}"`,
      sort: "-created",
      expand: "player",
    });

    return entries;
  } catch (error) {
    console.error("Error fetching session entries:", error);
    return [];
  }
}

/**
 * Update an entry's units
 */
export async function updateEntryUnits(
  entryId: string,
  units: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    await pb.collection("entries").update(entryId, { units });

    revalidatePath("/admin/sessions");
    revalidatePath("/leaderboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update entry",
    };
  }
}

/**
 * Delete an entry
 */
export async function deleteEntry(
  entryId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const pb = await getAdminPocketBase();
    if (!pb) {
      return { success: false, error: "Not authenticated" };
    }

    await pb.collection("entries").delete(entryId);

    revalidatePath("/admin/sessions");
    revalidatePath("/leaderboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete entry",
    };
  }
}
