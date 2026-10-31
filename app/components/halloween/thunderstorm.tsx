"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { THUNDER_EVENT, prefersReducedMotion, rand } from "./motion";

interface Bolt {
  left: number;
  delay: number;
  bolt: string;
  branches: string[];
}

interface Strike {
  id: number;
  bolts: Bolt[];
}

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

function makeBolt(left: number, delay: number): Bolt {
  const main = jagged(50, 0, rand(200, 290), rand(-3, 3));
  // Forks split off from points part way down the main bolt
  const branches = Array.from(
    { length: 2 + Math.floor(Math.random() * 3) },
    () => {
      const [x, y] = main[2 + Math.floor(Math.random() * (main.length - 4))];
      const side = Math.random() < 0.5 ? -1 : 1;
      return toPath(jagged(x, y, rand(40, 90), side * rand(4, 9)));
    },
  );
  return { left, delay, bolt: toPath(main), branches };
}

function makeStrike(id: number): Strike {
  const first = makeBolt(rand(8, 88), 0);
  // Half the time a second bolt follows close behind, well away from the first
  if (Math.random() < 0.5) {
    const left = (first.left + rand(25, 60)) % 90;
    return { id, bolts: [first, makeBolt(Math.max(8, left), rand(0.2, 0.45))] };
  }
  return { id, bolts: [first] };
}

const RUMBLE: Keyframe[] = [
  { transform: "translate(0, 0)" },
  { transform: "translate(-12px, 7px)" },
  { transform: "translate(10px, -8px)" },
  { transform: "translate(-9px, 5px)" },
  { transform: "translate(8px, -4px)" },
  { transform: "translate(-5px, 4px)" },
  { transform: "translate(4px, -2px)" },
  { transform: "translate(-2px, 1px)" },
  { transform: "translate(0, 0)" },
];

const HALF_RUMBLE: Keyframe[] = RUMBLE.map(({ transform }) => ({
  transform: String(transform).replace(
    /-?\d+px/g,
    (px) => `${parseInt(px) / 2}px`,
  ),
}));

/**
 * Every so often a randomly shaped bolt strikes somewhere in the sky, the sky
 * flashes, and a moment later the backdrop rumbles. Everything is
 * transform/opacity so it stays cheap on a TV.
 */
export default function Thunderstorm() {
  const [strike, setStrike] = useState<Strike | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let id = 0;

    const thunder = () => {
      setStrike(makeStrike(++id));
      window.dispatchEvent(new Event(THUNDER_EVENT));

      // Sound travels slower than light: rumble after the flash. The sky
      // shakes hard, the page itself a little.
      const rumble = { duration: 1300, delay: 300, easing: "ease-out" };
      document.querySelector(".spooky-scene")?.animate(RUMBLE, rumble);
      document.getElementById("page-content")?.animate(HALF_RUMBLE, rumble);

      timer = setTimeout(thunder, rand(14000, 40000));
    };

    timer = setTimeout(thunder, rand(4000, 10000));
    return () => clearTimeout(timer);
  }, []);

  if (!strike) return null;

  return (
    <div key={strike.id}>
      <div className="animate-sky-flash absolute inset-0 bg-[#cdb8ff] opacity-0" />
      {strike.bolts.map((bolt, b) => (
        <svg
          key={b}
          viewBox="0 0 100 300"
          className="animate-bolt-strike absolute top-0 h-[80vh] w-[26.7vh] -translate-x-1/2 opacity-0 overflow-visible"
          style={{ left: `${bolt.left}%`, animationDelay: `${bolt.delay}s` }}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Wide faint strokes under a thin bright one: a glow without a filter */}
          {[bolt.bolt, ...bolt.branches].map((d, i) => (
            <g key={i}>
              <path
                d={d}
                stroke="#b388ff"
                strokeOpacity="0.12"
                strokeWidth={i ? 12 : 26}
              />
              <path
                d={d}
                stroke="#c9a2ff"
                strokeOpacity="0.4"
                strokeWidth={i ? 6 : 12}
              />
              <path d={d} stroke="#fbf8ff" strokeWidth={i ? 1.6 : 3.4} />
            </g>
          ))}
        </svg>
      ))}
      {/* A fainter flash over the page itself, so it lights up the cards too */}
      {createPortal(
        <div className="spooky-scene fixed inset-0 z-30 opacity-25 pointer-events-none">
          <div className="animate-sky-flash absolute inset-0 bg-[#e6dcff] opacity-0" />
        </div>,
        document.body,
      )}
    </div>
  );
}
