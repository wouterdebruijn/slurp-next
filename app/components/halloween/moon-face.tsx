"use client";

import { useEffect, useRef } from "react";
import { play, prefersReducedMotion, rand, wait } from "./motion";

// Drop the face image here; until it exists, nothing is shown
const FACE_SRC = "/moon-face.png";
const PEAK_OPACITY = 0.12;

/**
 * Every minute or two a face faintly surfaces in the moon, lingers, and sinks
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
      await wait(rand(20000, 45000));
      while (alive) {
        const peak = { opacity: PEAK_OPACITY };
        await play(el, [{ opacity: 0 }, peak], {
          duration: rand(2500, 4000),
          easing: "ease-in-out",
        });
        if (!alive) break;
        await wait(rand(1500, 3500));
        await play(el, [peak, { opacity: 0 }], {
          duration: rand(3000, 5000),
          easing: "ease-in-out",
        });
        await wait(rand(45000, 120000));
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
        filter: "grayscale(1) sepia(0.6) contrast(1.2)",
        mixBlendMode: "multiply",
        maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
      }}
    />
  );
}
