"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNowPlaying } from "@/app/actions/spotify-actions";

const EQUALIZER = [
  { delay: "0s", duration: "0.9s" },
  { delay: "-0.4s", duration: "0.7s" },
  { delay: "-0.2s", duration: "1.1s" },
];

/** What's playing on the group's Spotify, via the server's Home Assistant link. */
export default function NowPlaying({ className = "" }: { className?: string }) {
  const { data: track } = useQuery({
    queryKey: ["now-playing"],
    queryFn: () => getNowPlaying(),
    refetchInterval: 5000,
  });
  const barRef = useRef<HTMLDivElement>(null);

  // Glide the progress bar between polls instead of jumping every 5s
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !track?.duration) return;

    const from = Math.min(1, track.position / track.duration);
    bar.style.transform = `scaleX(${from})`;
    if (!track.playing) return;

    const animation = bar.animate(
      [{ transform: `scaleX(${from})` }, { transform: "scaleX(1)" }],
      {
        duration: Math.max(0, track.duration - track.position) * 1000,
        easing: "linear",
        fill: "forwards",
      },
    );
    return () => animation.cancel();
  }, [track]);

  if (!track) return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 border-slime/60 bg-grave/95 p-2.5 pr-4 xl:gap-4 xl:p-3 xl:pr-5 short:gap-3 short:p-2.5 shadow-[0_0_18px_rgb(157_255_60_/_0.25)] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- served by our own art proxy */}
      <img
        src={`/api/spotify/art?track=${encodeURIComponent(track.trackId)}`}
        alt={track.album ?? ""}
        className="size-14 xl:size-20 short:size-11 shrink-0 rounded-lg bg-tomb object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs xl:text-sm short:text-xs font-semibold text-slime">
          {track.playing ? (
            <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
              {EQUALIZER.map((bar) => (
                <span
                  key={bar.delay}
                  className="animate-equalizer h-full w-0.75 origin-bottom rounded-sm bg-slime"
                  style={{
                    animationDelay: bar.delay,
                    animationDuration: bar.duration,
                  }}
                />
              ))}
            </span>
          ) : (
            <span aria-hidden="true">⏸</span>
          )}
          {track.playing ? "Now haunting the speakers" : "Paused"}
        </div>
        <p className="truncate font-bold text-bone xl:text-xl short:text-base">
          {track.title}
        </p>
        <p className="truncate text-sm xl:text-base short:text-sm text-mist">
          {track.artist}
        </p>
        <div className="mt-1.5 h-1 xl:h-1.5 short:h-1 overflow-hidden rounded-full bg-tomb">
          <div
            ref={barRef}
            className="h-full origin-left rounded-full bg-slime"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
