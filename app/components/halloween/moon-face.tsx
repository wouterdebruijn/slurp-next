"use client";

import { useEffect, useRef } from "react";
import { play, prefersReducedMotion, rand, wait } from "./motion";

// Until the image exists, nothing is shown.
// public/moon-face.png: cropped, greyscale "Charlie Kirk by Gage Skidmore"
// (https://commons.wikimedia.org/wiki/File:Charlie_Kirk_by_Gage_Skidmore.jpg),
// CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/).
const FACE_SRC = "/moon-face.png";
// Faint but recognisable once you look at the moon
const PEAK_OPACITY = 0.15;

/**
 * Every half minute to a minute a face faintly surfaces in the moon, lingers, and sinks
 * back. It is blended into the moon's surface and only ever barely visible.
 */
export default function MoonFace() {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let alive = true;
    const loop = async () => {
      // No image dropped in (or it failed before hydration): stay hidden
      const loaded = await el.decode().then(
        () => true,
        () => false,
      );
      if (!loaded) {
        el.style.display = "none";
        return;
      }
      await wait(rand(10000, 25000));
      while (alive) {
        const peak = { opacity: PEAK_OPACITY };
        await play(el, [{ opacity: 0 }, peak], {
          duration: rand(2500, 4000),
          easing: "ease-in-out",
        });
        if (!alive) break;
        await wait(rand(4000, 7000));
        await play(el, [peak, { opacity: 0 }], {
          duration: rand(3000, 5000),
          easing: "ease-in-out",
        });
        await wait(rand(25000, 60000));
      }
    };
    loop();

    return () => {
      alive = false;
      el.getAnimations().forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny decorative overlay, optional file
    <img
      ref={ref}
      src={FACE_SRC}
      alt=""
      className="absolute inset-0 size-full rounded-full object-cover pointer-events-none"
      style={{
        opacity: 0,
        // Tinted to the moon and blended into its surface, edges feathered away
        filter: "grayscale(1) sepia(0.6) contrast(1.4)",
        mixBlendMode: "multiply",
        maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
      }}
    />
  );
}
