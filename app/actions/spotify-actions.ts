"use server";

import { getSpotifyState, refreshSpotify } from "@/utils/homeAssistant";

export interface NowPlaying {
  playing: boolean;
  title: string;
  artist: string;
  album?: string;
  trackId: string;
  /** Seconds */
  duration: number;
  /** Seconds into the track at the moment this was returned */
  position: number;
  device?: string;
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  try {
    const { state, attributes } = await getSpotifyState();
    if (
      (state !== "playing" && state !== "paused") ||
      !attributes.media_title
    ) {
      return null;
    }

    const duration = attributes.media_duration ?? 0;
    // Home Assistant reports the position as of its last update; advance it to
    // now so the client can animate on from here without trusting its clock
    let position = attributes.media_position ?? 0;
    if (state === "playing" && attributes.media_position_updated_at) {
      position +=
        (Date.now() - Date.parse(attributes.media_position_updated_at)) / 1000;
    }

    if (state === "playing" && duration && position >= duration) {
      refreshSpotify();
    }

    return {
      playing: state === "playing",
      title: attributes.media_title,
      artist: attributes.media_artist ?? "",
      album: attributes.media_album_name,
      trackId: attributes.media_content_id ?? attributes.media_title,
      duration,
      position: duration ? Math.min(position, duration) : position,
      device: attributes.source,
    };
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return null;
  }
}
