"use client";

import { useEffect, useRef, useState } from "react";
import { Witch } from "./spooky-art";

interface Pose {
  x: number;
  y: number;
  dir: 1 | -1;
  scale: number;
  rot: number;
  duration: number;
  easing: string;
}

const SPEED = 0.4; // px per ms
const TURN_MS = 300;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// Each sparkle loops a short drift-and-fade from the broom tail. They ride
// along with the witch, so the whole flight stays transform/opacity only and
// runs on the compositor; a canvas trail was far too heavy for a TV.
const SPARKLES = [
  { color: "#ffb454", dy: -18, delay: 0 },
  { color: "#9dff3c", dy: 14, delay: 0.12 },
  { color: "#c9a2ff", dy: -6, delay: 0.24 },
  { color: "#ff7a18", dy: 22, delay: 0.36 },
  { color: "#f5eddc", dy: -24, delay: 0.48 },
  { color: "#9dff3c", dy: 6, delay: 0.6 },
  { color: "#ffb454", dy: -12, delay: 0.72 },
  { color: "#c9a2ff", dy: 18, delay: 0.84 },
];

/**
 * Sits on the moon, then every so often takes a randomized flight across the
 * screen and glides back home, trailing sparkles. It renders as a top-level
 * overlay so it flies over the page content, and follows the moon's box
 * (`#moon-home`) so it rests where the moon is on any screen size.
 */
export default function FlyingWitch() {
  const ref = useRef<HTMLDivElement>(null);
  const [flying, setFlying] = useState(false);
  const [home, setHome] = useState<{
    left: number;
    top: number;
    size: number;
  } | null>(null);

  useEffect(() => {
    const moon = document.getElementById("moon-home");
    if (!moon) return;

    const update = () => {
      const rect = moon.getBoundingClientRect();
      setHome({ left: rect.left, top: rect.top, size: rect.width });
    };
    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const ready = home !== null;

  useEffect(() => {
    const el = ref.current;
    if (
      !ready ||
      !el ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let animation: Animation | undefined;

    const fly = () => {
      const rect = el.getBoundingClientRect();
      const homeX = rect.left + rect.width / 2;
      const homeY = rect.top + rect.height / 2;
      const { innerWidth: vw, innerHeight: vh } = window;

      // Positions are offsets from home, which is where the witch rests.
      const poses: Pose[] = [
        {
          x: 0,
          y: 0,
          dir: 1,
          scale: 1,
          rot: 0,
          duration: 0,
          easing: "ease-in",
        },
      ];
      const last = () => poses[poses.length - 1];

      const goTo = (targetX: number, targetY: number, scale: number) => {
        const from = last();
        const x = targetX - homeX;
        const y = targetY - homeY;
        const dx = x - from.x;
        const dy = y - from.y;
        const facing: 1 | -1 = Math.abs(dx) > 40 ? (dx > 0 ? 1 : -1) : from.dir;

        // Turn on the spot first, so the flip reads as a banking turn
        if (facing !== from.dir) {
          poses.push({
            ...from,
            dir: facing,
            duration: TURN_MS,
            easing: "ease-in-out",
          });
        }

        poses.push({
          x,
          y,
          dir: facing,
          scale,
          rot: clamp(
            (facing * (Math.atan2(dy, Math.abs(dx)) * 180)) / Math.PI,
            -25,
            25,
          ),
          duration: Math.max(900, Math.hypot(dx, dy) / SPEED),
          easing: "linear",
        });
      };

      let lastX = homeX;
      const stops = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < stops; i++) {
        let targetX = rand(vw * 0.1, vw * 0.95);
        for (
          let tries = 0;
          tries < 5 && Math.abs(targetX - lastX) < vw * 0.15;
          tries++
        ) {
          targetX = rand(vw * 0.1, vw * 0.95);
        }
        lastX = targetX;
        goTo(targetX, rand(vh * 0.08, vh * 0.65), rand(0.7, 1.15));
      }

      // Now and then she leaves the screen and re-enters from the other side
      if (Math.random() < 0.3) {
        goTo(vw + 300, rand(vh * 0.1, vh * 0.5), 1);
        poses.push({ ...last(), duration: 1, easing: "linear" });
        poses.push({
          x: -300 - homeX,
          y: rand(vh * 0.1, vh * 0.5) - homeY,
          dir: 1,
          scale: 1,
          rot: 0,
          duration: 1,
          easing: "linear",
        });
      }

      goTo(homeX, homeY, 1);
      poses[poses.length - 2].easing = "ease-out";
      poses.push({
        ...last(),
        dir: 1,
        rot: 0,
        duration: TURN_MS,
        easing: "ease-in-out",
      });

      const total = poses.reduce((sum, pose) => sum + pose.duration, 0);
      let elapsed = 0;
      const keyframes = poses.map((pose) => {
        elapsed += pose.duration;
        return {
          offset: elapsed / total,
          easing: pose.easing,
          transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rot}deg) scale(${pose.dir * pose.scale}, ${pose.scale})`,
        };
      });

      setFlying(true);
      animation = el.animate(keyframes, { duration: total });
      animation.onfinish = () => {
        setFlying(false);
        timer = setTimeout(fly, rand(12000, 40000));
      };
    };

    timer = setTimeout(fly, rand(5000, 12000));

    return () => {
      clearTimeout(timer);
      animation?.cancel();
    };
  }, [ready]);

  if (!home) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={ref}
        className="absolute"
        style={{
          left: home.left,
          top: home.top,
          width: home.size,
          height: home.size,
          willChange: "transform",
        }}
      >
        {/* Pre-drawn glow instead of a filter, which would repaint every frame */}
        <div
          className={`absolute left-[10%] top-[30%] w-[80%] h-[45%] rounded-full transition-opacity duration-500 ${flying ? "opacity-100" : "opacity-0"}`}
          style={{
            background:
              "radial-gradient(closest-side, rgb(255 180 84 / 0.45), transparent)",
          }}
        />
        {flying && (
          <div className="absolute left-[14%] top-[62%]">
            {SPARKLES.map((sparkle, i) => (
              <span
                key={i}
                className="witch-sparkle"
                style={
                  {
                    "--dy": `${sparkle.dy}px`,
                    background: sparkle.color,
                    boxShadow: `0 0 6px 2px ${sparkle.color}`,
                    animationDelay: `${sparkle.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
        <Witch className="relative size-full overflow-visible" />
      </div>
    </div>
  );
}
