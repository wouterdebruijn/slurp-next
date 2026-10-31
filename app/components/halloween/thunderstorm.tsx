"use client";

import { useEffect, useState } from "react";

interface Strike {
  id: number;
  left: number;
  bolt: string;
  branches: string[];
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** A jagged line falling from (x, y), drifting sideways, in a 100x300 box. */
function jagged(x: number, y: number, length: number, drift: number) {
  const points = [[x, y]];
  const segments = Math.max(2, Math.round(length / 18));
  for (let i = 0; i < segments; i++) {
    x += rand(-14, 14) + drift;
    y += length / segments;
    points.push([x, y]);
  }
  return points;
}

const toPath = (points: number[][]) =>
  points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

function makeStrike(id: number): Strike {
  const main = jagged(50, 0, rand(200, 290), rand(-3, 3));
  // Forks split off from points part way down the main bolt
  const branches = Array.from(
    { length: 1 + Math.floor(Math.random() * 3) },
    () => {
      const [x, y] = main[2 + Math.floor(Math.random() * (main.length - 4))];
      const side = Math.random() < 0.5 ? -1 : 1;
      return toPath(jagged(x, y, rand(40, 90), side * rand(4, 9)));
    },
  );
  return { id, left: rand(8, 88), bolt: toPath(main), branches };
}

/**
 * Every so often a randomly shaped bolt strikes somewhere in the sky, the sky
 * flashes, and a moment later the backdrop rumbles. Everything is
 * transform/opacity so it stays cheap on a TV.
 */
export default function Thunderstorm() {
  const [strike, setStrike] = useState<Strike | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let id = 0;

    const thunder = () => {
      setStrike(makeStrike(++id));

      // Sound travels slower than light: rumble after the flash
      document
        .querySelector(".spooky-scene")
        ?.animate(
          [
            { transform: "translate(0, 0)" },
            { transform: "translate(-5px, 3px)" },
            { transform: "translate(4px, -3px)" },
            { transform: "translate(-3px, 2px)" },
            { transform: "translate(2px, -1px)" },
            { transform: "translate(0, 0)" },
          ],
          { duration: 700, delay: 350, easing: "ease-out" },
        );

      timer = setTimeout(thunder, rand(14000, 40000));
    };

    timer = setTimeout(thunder, rand(4000, 10000));
    return () => clearTimeout(timer);
  }, []);

  if (!strike) return null;

  return (
    <div key={strike.id}>
      <div className="animate-sky-flash absolute inset-0 bg-[#cdb8ff] opacity-0" />
      <svg
        viewBox="0 0 100 300"
        className="animate-bolt-strike absolute top-0 h-[60vh] w-[20vh] -translate-x-1/2 opacity-0 overflow-visible"
        style={{ left: `${strike.left}%` }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Wide faint stroke under a thin bright one: a glow without a filter */}
        {[strike.bolt, ...strike.branches].map((d, i) => (
          <g key={i}>
            <path
              d={d}
              stroke="#b388ff"
              strokeOpacity="0.35"
              strokeWidth={i ? 5 : 9}
            />
            <path d={d} stroke="#f5f0ff" strokeWidth={i ? 1.2 : 2.4} />
          </g>
        ))}
      </svg>
    </div>
  );
}
