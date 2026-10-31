"use client";

import { useEffect, useRef } from "react";
import { play, prefersReducedMotion, rand, wait } from "./motion";
import { Spider } from "./spooky-art";

// Keep clear of the QR code on the right so nobody has to scan around a spider
const MIN_X = 0.05;
const MAX_X = 0.8;

/**
 * A spider scuttles along the top of the screen, then at random spots lowers
 * itself on a thread, sways a while, and climbs back up.
 */
export default function SpiderWalker() {
  const walkerRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const walker = walkerRef.current;
    const thread = threadRef.current;
    const spider = spiderRef.current;
    const body = bodyRef.current;
    if (!walker || !thread || !spider || !body || prefersReducedMotion()) {
      return;
    }

    let alive = true;
    let x = rand(MIN_X, MAX_X) * window.innerWidth;
    walker.style.transform = `translateX(${x}px)`;

    const loop = async () => {
      while (alive) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Scuttle to a new spot well away from the current one
        let target = rand(MIN_X, MAX_X) * vw;
        for (let i = 0; i < 5 && Math.abs(target - x) < vw * 0.15; i++) {
          target = rand(MIN_X, MAX_X) * vw;
        }
        body.classList.add("animate-spider-scuttle");
        await play(
          walker,
          [
            { transform: `translateX(${x}px)` },
            { transform: `translateX(${target}px)` },
          ],
          {
            duration: Math.abs(target - x) / rand(0.12, 0.22),
            easing: "ease-in-out",
          },
        );
        body.classList.remove("animate-spider-scuttle");
        x = target;
        if (!alive) break;
        await wait(rand(300, 1500));

        // Drop down on a thread
        const drop = rand(0.15, 0.55) * vh;
        const down = {
          duration: drop * 4,
          easing: "cubic-bezier(0.3, 0.7, 0.4, 1)",
        };
        await Promise.all([
          play(
            thread,
            [{ transform: "scaleY(0)" }, { transform: `scaleY(${drop / vh})` }],
            down,
          ),
          play(
            spider,
            [
              { transform: "translateY(0)" },
              { transform: `translateY(${drop}px)` },
            ],
            down,
          ),
        ]);
        if (!alive) break;

        // Sway on the thread, pivoting from the top
        const at = `translateX(${x}px)`;
        await play(
          walker,
          [
            { transform: `${at} rotate(0deg)` },
            { transform: `${at} rotate(5deg)` },
            { transform: `${at} rotate(-4deg)` },
            { transform: `${at} rotate(2deg)` },
            { transform: `${at} rotate(0deg)` },
          ],
          { duration: rand(2000, 4500), easing: "ease-in-out" },
        );
        if (!alive) break;

        // Climb back up, slower than the drop
        const up = { duration: drop * 7, easing: "ease-in-out" };
        await Promise.all([
          play(
            thread,
            [{ transform: `scaleY(${drop / vh})` }, { transform: "scaleY(0)" }],
            up,
          ),
          play(
            spider,
            [
              { transform: `translateY(${drop}px)` },
              { transform: "translateY(0)" },
            ],
            up,
          ),
        ]);
        await wait(rand(500, 3000));
      }
    };
    loop();

    return () => {
      alive = false;
      for (const el of [walker, thread, spider]) {
        el.getAnimations().forEach((animation) => animation.cancel());
      }
    };
  }, []);

  return (
    <div
      className="spooky-scene hidden md:block fixed inset-0 z-40 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={walkerRef}
        className="absolute left-0 top-[1.5vh] origin-top"
        style={{ willChange: "transform" }}
      >
        <div
          ref={threadRef}
          className="absolute left-[-0.5px] top-0 h-screen w-px origin-top bg-mist/60"
          style={{ transform: "scaleY(0)" }}
        />
        <div ref={spiderRef} className="absolute left-0 top-0">
          <div className="-ml-5 lg:-ml-7 -mt-2">
            <div ref={bodyRef}>
              <Spider className="w-10 lg:w-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
