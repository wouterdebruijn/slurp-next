import { getSpotifyState, haFetch } from "@/utils/homeAssistant";

/**
 * Album art for the current Spotify track, fetched by the server so the
 * browser never talks to Home Assistant. `?track=` is the track id the client
 * expects; it makes the URL a per-track cache key.
 */
export async function GET(request: Request) {
  try {
    const track = new URL(request.url).searchParams.get("track");
    const { attributes } = await getSpotifyState();
    if (!attributes.entity_picture) {
      return new Response(null, { status: 404 });
    }

    const art = await haFetch(attributes.entity_picture);
    // Only cache when it's the art for the track that was asked for; the song
    // may have changed between the client's poll and this request
    const cacheable = track !== null && track === attributes.media_content_id;
    return new Response(art.body, {
      headers: {
        "Content-Type": art.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": cacheable
          ? "public, max-age=86400, immutable"
          : "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching album art:", error);
    return new Response(null, { status: 502 });
  }
}
