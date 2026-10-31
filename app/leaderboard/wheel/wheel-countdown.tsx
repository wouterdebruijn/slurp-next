"use client";

import { useEffect, useState } from "react";
import { nextSpinTime } from "./schedule";
import { isAudioUnlocked, unlockAudioOnGesture } from "./spooky-audio";

const format = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/** "Wheel of Doom in 12:34", plus a hint while the browser keeps audio locked. */
export default function WheelCountdown() {
  const [now, setNow] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    const stopListening = unlockAudioOnGesture(() => setSoundOn(true));
    return () => {
      clearInterval(interval);
      stopListening();
    };
  }, []);

  // Rendered after mount only, so server and client markup match
  if (now === null) return null;
  const remaining = nextSpinTime(now) - now;
  const soon = remaining < 60_000;

  return (
    <p
      className={`mt-1 text-sm xl:text-lg font-bold ${soon ? "animate-pulse text-blood" : "text-mist"}`}
    >
      🎡 Wheel of Doom in {format(remaining)}
      {!(soundOn || isAudioUnlocked()) && (
        <span className="ml-2 font-semibold text-mist/70">
          🔇 tap for sound
        </span>
      )}
    </p>
  );
}
