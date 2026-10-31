"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SHOT_EVENT,
  THUNDER_EVENT,
  play,
  prefersReducedMotion,
  rand,
  wait,
} from "./motion";
import { Flame, Tombstone, WoodenCross, Zombie } from "./spooky-art";

// Graves sit between the burning cross and the chart, as a share of the screen width
const GRAVES = [12, 21, 30];
const MAX_ZOMBIES = 3;

// Fire climbs the post and licks the tips of the crossbar, leaving the shape readable
const FLAMES = [
  {
    box: "left-[0.3vh] bottom-0 h-[6.5vh] w-[5vh]",
    duration: "0.9s",
    delay: "0s",
  },
  {
    box: "left-[1.2vh] bottom-[1.5vh] h-[6vh] w-[3.5vh]",
    duration: "0.7s",
    delay: "-0.3s",
  },
  {
    box: "left-[1.6vh] bottom-[0.5vh] h-[4vh] w-[2.6vh]",
    duration: "0.6s",
    delay: "-0.2s",
  },
  {
    box: "left-[-0.4vh] bottom-[8.2vh] h-[2.6vh] w-[1.8vh]",
    duration: "0.65s",
    delay: "-0.4s",
  },
  {
    box: "left-[4.2vh] bottom-[8.2vh] h-[2.4vh] w-[1.6vh]",
    duration: "0.75s",
    delay: "-0.1s",
  },
];

const EMBERS = [
  { left: "1.5vh", dx: "-2vh", duration: "1.8s", delay: "0s" },
  { left: "3vh", dx: "1.5vh", duration: "2.2s", delay: "-0.6s" },
  { left: "2.2vh", dx: "-0.5vh", duration: "1.6s", delay: "-1.1s" },
  { left: "4vh", dx: "2.5vh", duration: "2.4s", delay: "-1.6s" },
  { left: "0.5vh", dx: "-1.5vh", duration: "2s", delay: "-0.9s" },
];

const BURST = [
  { dx: "-4vh", dy: "-9vh" },
  { dx: "-2vh", dy: "-12vh" },
  { dx: "0vh", dy: "-14vh" },
  { dx: "2vh", dy: "-11vh" },
  { dx: "4vh", dy: "-8vh" },
  { dx: "1vh", dy: "-13vh" },
  { dx: "-1vh", dy: "-10vh" },
  { dx: "3vh", dy: "-12vh" },
];

const DIRT = [
  { dx: "-3vh", dy: "-4vh" },
  { dx: "-1.5vh", dy: "-6vh" },
  { dx: "0.5vh", dy: "-5vh" },
  { dx: "2vh", dy: "-6.5vh" },
  { dx: "3.5vh", dy: "-3.5vh" },
  { dx: "-2.5vh", dy: "-2.5vh" },
];

/**
 * A zombie keeps a grave cross burning in the bottom-left margin. He stokes
 * the fire now and then, cheers when someone takes a shot, and flinches at
 * thunder. Everything animates transform/opacity only.
 */
function BurningCross() {
  const glowRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const keeperRef = useRef<HTMLDivElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const glow = glowRef.current;
    const flames = flamesRef.current;
    const keeper = keeperRef.current;
    const torch = torchRef.current;
    if (!glow || !flames || !keeper || !torch || prefersReducedMotion()) {
      return;
    }

    let alive = true;
    let busy = false;

    const flare = (size: number) => {
      const timing = { duration: 900 + size * 400, easing: "ease-out" };
      const grow = [
        { transform: "scale(1)" },
        { transform: `scale(${size})`, offset: 0.2 },
        { transform: "scale(1)" },
      ];
      play(flames, grow, timing);
      play(glow, grow, timing);
      if (size > 1.4) setBurst((n) => n + 1);
    };

    const stoke = async () => {
      busy = true;
      await play(
        keeper,
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: "translate(-1.4vh, 2%) rotate(-10deg)", offset: 0.45 },
          { transform: "translate(0, 0) rotate(0deg)" },
        ],
        { duration: 1000, easing: "ease-in-out" },
      );
      busy = false;
    };

    const cheer = async () => {
      busy = true;
      flare(1.9);
      setTimeout(() => alive && flare(1.6), 700);
      play(
        torch,
        [
          { transform: "rotate(25deg)" },
          { transform: "rotate(-30deg)", offset: 0.15 },
          { transform: "rotate(-30deg)", offset: 0.85 },
          { transform: "rotate(25deg)" },
        ],
        { duration: 1900, easing: "ease-in-out" },
      );
      for (let jump = 0; jump < 3 && alive; jump++) {
        await play(
          keeper,
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-40%)", offset: 0.45 },
            { transform: "translateY(0)" },
          ],
          { duration: 600, easing: "ease-in-out" },
        );
      }
      busy = false;
    };

    const flinch = () => {
      // Lands with the thunder's rumble
      setTimeout(() => {
        if (!alive) return;
        play(
          keeper,
          [
            { transform: "translate(0, 0) rotate(0deg)" },
            { transform: "translate(1.8vh, -18%) rotate(12deg)", offset: 0.25 },
            { transform: "translate(1.2vh, 0) rotate(6deg)", offset: 0.55 },
            { transform: "translate(0, 0) rotate(0deg)" },
          ],
          { duration: 1100, easing: "ease-out" },
        );
      }, 300);
    };

    const loop = async () => {
      while (alive) {
        await wait(rand(4000, 9000));
        if (!alive || busy) continue;
        setTimeout(() => alive && flare(1.3), 400);
        await stoke();
      }
    };
    loop();

    window.addEventListener(SHOT_EVENT, cheer);
    window.addEventListener(THUNDER_EVENT, flinch);
    return () => {
      alive = false;
      window.removeEventListener(SHOT_EVENT, cheer);
      window.removeEventListener(THUNDER_EVENT, flinch);
      for (const el of [glow, flames, keeper, torch]) {
        el.getAnimations().forEach((animation) => animation.cancel());
      }
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-[1.5vh] h-full w-[14vh]">
      <div ref={glowRef} className="absolute inset-0 origin-[2.75vh_100%]">
        <div
          className="animate-fire-glow absolute -left-[8vh] -bottom-[6vh] size-[22vh] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgb(255 122 24 / 0.45), rgb(211 18 42 / 0.15) 60%, transparent)",
          }}
        />
      </div>
      <WoodenCross className="absolute bottom-0 left-0 h-[11vh] w-[5.5vh]" />
      <div ref={flamesRef} className="absolute inset-0 origin-[2.75vh_100%]">
        {FLAMES.map((flame) => (
          <div
            key={flame.box}
            className={`animate-flame-flicker absolute origin-bottom ${flame.box}`}
            style={{
              animationDuration: flame.duration,
              animationDelay: flame.delay,
            }}
          >
            <Flame className="size-full" />
          </div>
        ))}
      </div>
      {EMBERS.map((ember) => (
        <span
          key={ember.left + ember.delay}
          className="animate-ember-rise absolute bottom-[9vh] size-1 rounded-full bg-[#ffb454] shadow-[0_0_6px_2px_#ff7a18]"
          style={
            {
              left: ember.left,
              "--dx": ember.dx,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
            } as React.CSSProperties
          }
        />
      ))}
      {/* A one-off shower of sparks when the fire erupts */}
      {burst > 0 &&
        BURST.map((spark, i) => (
          <span
            key={`${burst}-${i}`}
            className="animate-burst absolute bottom-[6vh] left-[2.5vh] size-1.5 rounded-full bg-[#fff2b0] shadow-[0_0_8px_3px_#ff7a18]"
            style={
              {
                "--dx": spark.dx,
                "--dy": spark.dy,
                animationDelay: `${i * 0.03}s`,
              } as React.CSSProperties
            }
          />
        ))}
      {/* Torch-bearer, facing the cross */}
      <div
        ref={keeperRef}
        className="absolute bottom-0 left-[7vh] origin-bottom"
      >
        <div className="animate-zombie-lurch origin-bottom [animation-duration:2.2s]">
          <div className="relative -scale-x-100">
            <Zombie className="h-[6.5vh] w-auto" />
            <div
              ref={torchRef}
              className="absolute left-[88%] -top-[0.6vh] h-[3vh] w-[0.5vh] origin-bottom rounded-sm bg-[#4a2e1a]"
              style={{ transform: "rotate(25deg)" }}
            >
              <div className="animate-flame-flicker absolute -top-[2vh] -left-[0.6vh] h-[2.4vh] w-[1.7vh] origin-bottom [animation-duration:0.5s]">
                <Flame className="size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Risen {
  id: number;
  grave: number;
  dir: 1 | -1;
  distance: number;
  height: number;
  speed: number;
  lurch: number;
}

/** Claws out of its grave in a spray of dirt, shambles off, fades into the fog. */
function RisingZombie({
  zombie,
  onGone,
}: {
  zombie: Risen;
  onGone: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;

    const run = async () => {
      await play(
        el,
        [
          { transform: "translate(0, 110%) rotate(8deg)" },
          { transform: "translate(0, 55%) rotate(-7deg)", offset: 0.45 },
          { transform: "translate(0, 20%) rotate(5deg)", offset: 0.75 },
          { transform: "translate(0, 0) rotate(0deg)" },
        ],
        { duration: 2600, easing: "ease-out" },
      );
      if (!alive) return;
      await wait(rand(400, 1200));

      const px = (zombie.distance / 100) * window.innerWidth;
      const end = `translate(${zombie.dir * px}px, 0)`;
      await play(el, [{ transform: "translate(0, 0)" }, { transform: end }], {
        duration: px / zombie.speed,
        easing: "linear",
      });
      if (!alive) return;
      await play(
        el,
        [
          { transform: end, opacity: 1 },
          { transform: end, opacity: 0 },
        ],
        { duration: 1500, easing: "ease-in" },
      );
      if (alive) onGone(zombie.id);
    };
    run();

    return () => {
      alive = false;
      el.getAnimations().forEach((animation) => animation.cancel());
    };
  }, [zombie, onGone]);

  return (
    <div
      className="absolute bottom-0"
      style={{ left: `calc(${zombie.grave}vw + 0.5vh)` }}
    >
      {DIRT.map((dirt, i) => (
        <span
          key={i}
          className="animate-dirt-spray absolute bottom-0 left-[2vh] size-1.5 rounded-sm bg-[#5a3c26]"
          style={
            {
              "--dx": dirt.dx,
              "--dy": dirt.dy,
              animationDelay: `${0.2 + i * 0.12}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <div
        ref={ref}
        style={{ transform: "translate(0, 110%)", willChange: "transform" }}
      >
        <div
          className="animate-zombie-lurch origin-bottom"
          style={{ animationDuration: `${zombie.lurch}s` }}
        >
          <div className={zombie.dir < 0 ? "-scale-x-100" : undefined}>
            <Zombie
              className="w-auto"
              style={{ height: `${zombie.height}vh` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Zombies rise from graves along the bottom-left edge, in front of the page,
 * while one tends a burning cross. Wide screens only, so they never cover a
 * phone's join form.
 */
export default function ZombieHorde() {
  const [risen, setRisen] = useState<Risen[]>([]);

  const onGone = useCallback(
    (id: number) => setRisen((zombies) => zombies.filter((z) => z.id !== id)),
    [],
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let id = 0;
    let timer: ReturnType<typeof setTimeout>;

    const spawn = () => {
      setRisen((zombies) => {
        if (zombies.length >= MAX_ZOMBIES) return zombies;
        const taken = new Set(zombies.map((z) => z.grave));
        const free = GRAVES.filter((grave) => !taken.has(grave));
        const grave = free[Math.floor(Math.random() * free.length)];
        if (grave === undefined) return zombies;

        // Left heads for the fire, right towards the chart; fade out before either
        const dir: 1 | -1 = Math.random() < 0.5 ? -1 : 1;
        const room = dir < 0 ? grave - 9 : 36 - grave;
        return [
          ...zombies,
          {
            id: ++id,
            grave,
            dir,
            distance: rand(0.5, 1) * room,
            height: rand(5, 6.8),
            speed: rand(0.02, 0.035),
            lurch: rand(1.1, 1.8),
          },
        ];
      });
      timer = setTimeout(spawn, rand(5000, 14000));
    };

    timer = setTimeout(spawn, rand(1000, 3000));
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="spooky-scene hidden lg:block fixed bottom-0 left-0 z-40 w-[40vw] h-[26vh] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <BurningCross />
      {GRAVES.map((grave) => (
        <Tombstone
          key={grave}
          className="absolute bottom-0 h-[5vh] w-[4vh]"
          style={{ left: `${grave}vw` }}
        />
      ))}
      {risen.map((zombie) => (
        <RisingZombie key={zombie.id} zombie={zombie} onGone={onGone} />
      ))}
    </div>
  );
}
