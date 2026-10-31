"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spider, SpiderWeb } from "@/app/components/halloween/spooky-art";
import {
  play,
  prefersReducedMotion,
  rand,
  wait,
} from "@/app/components/halloween/motion";

// On the wall clock like the Wheel of Doom, but halfway between its spins
// (:07:30, :22:30, :37:30, :52:30) so the two never overlap
const INTERVAL_MS = 15 * 60 * 1000;
const OFFSET_MS = 7.5 * 60 * 1000;
const HOSTAGE_MS = 60_000;
const SPIDERS = 6;

const WEBS = [
  { box: "left-0 top-0 h-3/4", delay: "0s" },
  { box: "right-0 top-0 h-3/4 -scale-x-100", delay: "0.4s" },
  { box: "bottom-0 left-0 h-1/2 -scale-y-100", delay: "0.8s" },
  { box: "bottom-0 right-0 h-1/2 -scale-100", delay: "1.2s" },
];

const nextHeistTime = (now = Date.now()) =>
  Math.floor((now - OFFSET_MS) / INTERVAL_MS + 1) * INTERVAL_MS + OFFSET_MS;

interface Point {
  x: number;
  y: number;
}

/** Degrees to face from one point towards another; the spider art faces up. */
const heading = (from: Point, to: Point) =>
  (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90;

/** The nearest equivalent of `to`, so turns never spin the long way round. */
const nearestAngle = (from: number, to: number) =>
  from + ((((to - from) % 360) + 540) % 360) - 180;

/**
 * Every 15 minutes six spiders scuttle in, grab the graph and drag it off the
 * screen. They hold it hostage for a minute, webbing up its spot, then drag it
 * back and climb away. `?heist` in the URL starts one a few seconds after load.
 */
export default function SpiderHeist({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spiderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hostageRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<DOMRect | null>(null);
  const [returnsAt, setReturnsAt] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      // Wide screens only: on phones the graph is further down a scrolling page
      const card = cardRef.current;
      if (!card || !window.matchMedia("(min-width: 64rem)").matches) return;
      setArea(card.getBoundingClientRect());
    };
    const schedule = () => {
      timer = setTimeout(() => {
        start();
        schedule();
      }, nextHeistTime() - Date.now());
    };

    if (new URLSearchParams(window.location.search).has("heist")) {
      timer = setTimeout(() => {
        start();
        schedule();
      }, 3000);
    } else {
      schedule();
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    const spiders = spiderRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (!area || !card || spiders.length < SPIDERS) return;

    let alive = true;
    const size = spiders[0].offsetWidth;
    const vw = window.innerWidth;
    const pos: Point[] = spiders.map(() => ({ x: vw + size, y: area.top }));
    const angle: number[] = spiders.map(() => -90);

    const place = (p: Point, a: number) =>
      `translate(${p.x - size / 2}px, ${p.y - size / 2}px) rotate(${a}deg)`;

    const turn = async (i: number, to: number) => {
      const target = nearestAngle(angle[i], to);
      if (Math.abs(target - angle[i]) < 1) return;
      await play(
        spiders[i],
        [
          { transform: place(pos[i], angle[i]) },
          { transform: place(pos[i], target) },
        ],
        { duration: 250, easing: "ease-in-out" },
      );
      angle[i] = target;
    };

    const crawl = async (i: number, to: Point, speed = rand(0.25, 0.4)) => {
      await turn(i, heading(pos[i], to));
      if (!alive) return;
      const distance = Math.hypot(to.x - pos[i].x, to.y - pos[i].y);
      await play(
        spiders[i],
        [
          { transform: place(pos[i], angle[i]) },
          { transform: place(to, angle[i]) },
        ],
        { duration: Math.max(150, distance / speed), easing: "linear" },
      );
      pos[i] = to;
    };

    const teleport = (i: number, to: Point, a: number) => {
      pos[i] = to;
      angle[i] = a;
      spiders[i].style.transform = place(to, a);
    };

    /** Card and spiders move as one along x, ending `to` px from the card's home. */
    const drag = (
      grips: Point[],
      to: number,
      keyframes: { dx: number; offset?: number; easing?: string }[],
      duration: number,
    ) =>
      Promise.all([
        play(
          card,
          keyframes.map(({ dx, offset, easing }) => ({
            transform: `translateX(${dx}px)`,
            offset,
            easing,
          })),
          { duration },
        ),
        ...grips.map((grip, i) =>
          play(
            spiders[i],
            keyframes.map(({ dx, offset, easing }) => ({
              transform: place({ x: grip.x + dx, y: grip.y }, angle[i]),
              offset,
              easing,
            })),
            { duration },
          ).then(() => {
            pos[i] = { x: grip.x + to, y: grip.y };
          }),
        ),
      ]);

    const run = async () => {
      const away = vw - area.left + 60;
      const edges = [area.top, area.bottom];

      // 1. Scuttle in from the right and grab the right half of the card
      const pullGrips = spiders.map((_, i) => ({
        x: area.left + area.width * [0.6, 0.78, 0.94][i % 3],
        y: edges[Math.floor(i / 3)],
      }));
      spiders.forEach((_, i) =>
        teleport(i, { x: vw + size, y: pullGrips[i].y }, -90),
      );
      await Promise.all(
        spiders.map(async (_, i) => {
          await wait(i * 180);
          if (!alive) return;
          await crawl(i, pullGrips[i]);
          if (alive) await turn(i, 90);
        }),
      );
      if (!alive) return;
      await wait(500);

      // 2. Heave: a little wind-up, then drag it off to the right
      await drag(
        pullGrips,
        away,
        [
          { dx: 0, easing: "ease-out" },
          { dx: -18, offset: 0.2, easing: "cubic-bezier(0.55, 0, 1, 0.45)" },
          { dx: away },
        ],
        3200,
      );
      if (!alive) return;

      // 3. Hold it hostage: web up the empty spot and wander around in it
      setReturnsAt(Date.now() + HOSTAGE_MS);
      const until = performance.now() + HOSTAGE_MS - 5000;
      const margin = size;
      const somewhere = () => ({
        x: rand(area.left + margin, area.right - margin),
        y: rand(area.top + margin, area.bottom - margin),
      });
      await Promise.all(
        spiders.map(async (_, i) => {
          await wait(i * 400);
          teleport(i, { x: vw + size, y: somewhere().y }, -90);
          while (alive && performance.now() < until) {
            await crawl(i, somewhere(), rand(0.15, 0.35));
            await wait(rand(300, 2000));
          }
          if (alive) await crawl(i, { x: vw + size, y: pos[i].y });
        }),
      );
      if (!alive) return;

      const hostage = hostageRef.current;
      if (hostage) {
        await play(hostage, [{ opacity: 1 }, { opacity: 0 }], {
          duration: 700,
        });
      }
      setReturnsAt(null);

      // 4. Drag it back in by its left edge
      const returnGrips = spiders.map((_, i) => ({
        x: area.left + area.width * [0.05, 0.2, 0.35][i % 3],
        y: edges[Math.floor(i / 3)],
      }));
      returnGrips.forEach((grip, i) =>
        teleport(i, { x: grip.x + away, y: grip.y }, -90),
      );
      await drag(
        returnGrips,
        0,
        [
          { dx: away, easing: "cubic-bezier(0.2, 0.6, 0.35, 1)" },
          { dx: -14, offset: 0.85, easing: "ease-in-out" },
          { dx: 0 },
        ],
        3600,
      );
      if (!alive) return;
      card.style.transform = "";
      await wait(400);

      // 5. Let go and climb off the top
      await Promise.all(
        spiders.map(async (_, i) => {
          await wait(rand(0, 600));
          if (alive) await crawl(i, { x: pos[i].x + rand(-60, 60), y: -size });
        }),
      );
      if (alive) setArea(null);
    };
    run();

    return () => {
      alive = false;
      for (const el of [card, ...spiders]) {
        el.getAnimations().forEach((animation) => animation.cancel());
      }
      card.style.transform = "";
    };
  }, [area]);

  return (
    <>
      <div ref={cardRef} className={className}>
        {children}
      </div>
      {area &&
        createPortal(
          <div
            className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {returnsAt && (
              <div
                ref={hostageRef}
                className="absolute"
                style={{
                  left: area.left,
                  top: area.top,
                  width: area.width,
                  height: area.height,
                }}
              >
                {/* Each corner flips its wrapper in place, so every web grows out of its own corner */}
                {WEBS.map((web) => (
                  <div
                    key={web.box}
                    className={`absolute aspect-square ${web.box}`}
                  >
                    <SpiderWeb
                      className="animate-web-grow size-full origin-top-left"
                      style={{ animationDelay: web.delay }}
                    />
                  </div>
                ))}
                <div className="animate-hostage-in absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="font-spooky text-[6vh] leading-tight tracking-wide text-bone text-glow-slime">
                    The spiders stole the graph!
                  </p>
                  <p className="mt-[1vh] text-[2.6vh] font-bold text-slime">
                    🕷️ It&apos;ll be back in <Countdown to={returnsAt} /> 🕷️
                  </p>
                </div>
              </div>
            )}
            {Array.from({ length: SPIDERS }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  spiderRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 size-[8vh]"
                style={{
                  transform: "translate(-100vw, 0)",
                  willChange: "transform",
                }}
              >
                <div className="animate-spider-scuttle size-full">
                  <Spider className="size-full drop-shadow-[0_0_6px_rgb(201_162_255_/_0.7)]" />
                </div>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function Countdown({ to }: { to: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const seconds = Math.max(0, Math.ceil((to - now) / 1000));
  return (
    <span className="tabular-nums">
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}
