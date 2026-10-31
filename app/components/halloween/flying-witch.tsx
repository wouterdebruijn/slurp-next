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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const PARTICLE_COLORS = ["#ffb454", "#ff7a18", "#9dff3c", "#c9a2ff", "#f5eddc"];
const MAX_PARTICLES = 160;

/**
 * Sits on the moon, then every so often takes a randomized flight across the
 * screen and glides back home, trailing sparkles. It renders as a top-level
 * overlay so it flies over the page content, and follows the moon's box
 * (`#moon-home`) so it rests where the moon is on any screen size.
 */
export default function FlyingWitch() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const observer = new ResizeObserver(update);
    observer.observe(moon);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const ready = home !== null;

  useEffect(() => {
    const el = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (
      !ready ||
      !el ||
      !canvas ||
      !ctx ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let animation: Animation | undefined;
    let raf = 0;
    let flying = false;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Sparkles spawn at the broom tail while she flies, then drift and fade
    let lastTime = 0;
    let prev: { x: number; y: number } | null = null;
    let dir = 1;
    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
      lastTime = time;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (flying) {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        if (prev) {
          const moved = Math.hypot(x - prev.x, y - prev.y);
          if (Math.abs(x - prev.x) > 0.3) dir = x > prev.x ? 1 : -1;
          if (moved > 0.5) {
            for (let i = 0; i < 2 && particles.length < MAX_PARTICLES; i++) {
              const maxLife = rand(0.7, 1.6);
              particles.push({
                x: x - dir * rect.width * 0.3 + rand(-6, 6),
                y: y + rect.height * 0.06 + rand(-6, 6),
                vx: -dir * rand(5, 40),
                vy: rand(-25, 20),
                life: maxLife,
                maxLife,
                size: rand(1.5, 4.5),
                color:
                  PARTICLE_COLORS[
                    Math.floor(Math.random() * PARTICLE_COLORS.length)
                  ],
              });
            }
          }
        }
        prev = { x, y };
      }

      ctx.globalCompositeOperation = "lighter";
      particles = particles.filter((p) => (p.life -= dt) > 0);
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 30 * dt;
        const t = p.life / p.maxLife;
        ctx.globalAlpha = t;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      raf = flying || particles.length > 0 ? requestAnimationFrame(loop) : 0;
    };

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

      flying = true;
      // A black silhouette vanishes against dark cards, so glow while in flight
      el.style.filter = "drop-shadow(0 0 6px rgb(255 180 84 / 0.7))";
      prev = null;
      dir = 1;
      if (!raf) raf = requestAnimationFrame(loop);

      animation = el.animate(keyframes, { duration: total });
      animation.onfinish = () => {
        flying = false;
        el.style.filter = "";
        timer = setTimeout(fly, rand(12000, 40000));
      };
    };

    timer = setTimeout(fly, rand(5000, 12000));

    return () => {
      clearTimeout(timer);
      animation?.cancel();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [ready]);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {home && (
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
          <Witch className="size-full overflow-visible" />
        </div>
      )}
    </div>
  );
}
