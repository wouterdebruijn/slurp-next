// Server-only: holds the Home Assistant token. Never import from client code.

const HA_URL = process.env.HA_URL ?? "https://ha.hedium.nl";
export const SPOTIFY_ENTITY =
  process.env.HA_SPOTIFY_ENTITY ?? "media_player.spotify_wouter";
// A text helper holding the current Spotify Jam invite link, pasted in by hand
export const JAM_ENTITY =
  process.env.HA_SPOTIFY_JAM_ENTITY ?? "input_text.spotify_jam";

const JAM_HOSTS = ["open.spotify.com", "spotify.link", "spotify.app.link"];

export interface MediaPlayerState {
  state: string;
  attributes: {
    media_title?: string;
    media_artist?: string;
    media_album_name?: string;
    media_content_id?: string;
    media_duration?: number;
    media_position?: number;
    media_position_updated_at?: string;
    entity_picture?: string;
    source?: string;
  };
}

export async function haFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<Response> {
  const token = process.env.HA_TOKEN;
  if (!token) {
    throw new Error("HA_TOKEN is not set in environment variables");
  }

  const response = await fetch(new URL(path, HA_URL), {
    method: init?.method,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Home Assistant ${path} responded ${response.status}`);
  }
  return response;
}

// The Spotify integration only polls about every 30s, so a finished song can
// linger. Ask for a refresh when we know it has ended, at most every 10s.
let lastRefresh = 0;
export function refreshSpotify() {
  if (Date.now() - lastRefresh < 10_000) return;
  lastRefresh = Date.now();
  haFetch("/api/services/homeassistant/update_entity", {
    method: "POST",
    body: { entity_id: SPOTIFY_ENTITY },
  }).catch((error) => console.error("Error refreshing Spotify:", error));
}

/** The Jam invite link, if one is set and it really points at Spotify. */
export async function getJamUrl(): Promise<string | undefined> {
  try {
    const response = await haFetch(`/api/states/${JAM_ENTITY}`);
    const { state } = (await response.json()) as { state: string };
    const url = new URL(state.trim());
    return url.protocol === "https:" && JAM_HOSTS.includes(url.hostname)
      ? url.toString()
      : undefined;
  } catch {
    // No helper, empty, or not a URL: just don't show the QR
    return undefined;
  }
}

export async function getSpotifyState(): Promise<MediaPlayerState> {
  const response = await haFetch(`/api/states/${SPOTIFY_ENTITY}`);
  return response.json();
}
