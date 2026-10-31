"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Pumpkin } from "@/app/components/halloween/spooky-art";
import {
  SHOT_EVENT,
  WHEEL_EVENT,
  prefersReducedMotion,
  wait,
} from "@/app/components/halloween/motion";
import { getUsernameColor } from "@/utils/colorUtils";
import { nextSpinTime, seededRandom } from "./schedule";
import { playIntro, playReveal, playTick } from "./spooky-audio";

interface Player {
  id: string;
  username: string;
}

interface Spin {
  key: number;
  players: Player[];
  winner: number;
  /** Final clockwise rotation in degrees */
  rotation: number;
}

const SPIN_MS = 9000;
const REVEAL_MS = 9000;
const BULBS = 24;

// Clockwise from 12 o'clock, in the wheel's -100..100 box
const point = (degrees: number, radius: number) => {
  const radians = (degrees * Math.PI) / 180;
  return `${(radius * Math.sin(radians)).toFixed(2)} ${(-radius * Math.cos(radians)).toFixed(2)}`;
};

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function planSpin(
  sessionId: string,
  slot: number,
  players: Player[],
): Spin | null {
  // Same order and same random numbers on every screen
  const sorted = [...players].sort((a, b) => a.id.localeCompare(b.id));
  if (sorted.length < 2) return null;

  const random = seededRandom(`${sessionId}:${slot}`);
  const winner = Math.floor(random() * sorted.length);
  const segment = 360 / sorted.length;
  const turns = 6 + Math.floor(random() * 3);
  const jitter = (random() - 0.5) * 0.7 * segment;
  // Land with the winner's segment under the pointer at the top
  const rotation = turns * 360 - ((winner + 0.5) * segment + jitter);
  return { key: slot, players: sorted, winner, rotation };
}

/**
 * Four times an hour a Wheel of Doom takes over the screen, spins through the
 * players and picks one who has to take a shot. `?wheel` in the URL spins a
 * few seconds after load, for trying it out.
 */
export default function WheelOfDoom({
  sessionId,
  players,
  enabled,
}: {
  sessionId: string;
  players: Player[];
  enabled: boolean;
}) {
  const [spin, setSpin] = useState<Spin | null>(null);
  const playersRef = useRef(players);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;

    const start = (slot: number) =>
      setSpin(planSpin(sessionId, slot, playersRef.current));

    const schedule = () => {
      const at = nextSpinTime();
      timer = setTimeout(() => {
        start(at);
        schedule();
      }, at - Date.now());
    };

    if (new URLSearchParams(window.location.search).has("wheel")) {
      timer = setTimeout(() => {
        start(Date.now());
        schedule();
      }, 3000);
    } else {
      schedule();
    }
    return () => clearTimeout(timer);
  }, [enabled, sessionId]);

  // Stable, so the leaderboard's 5s refreshes don't restart a spin midway
  const finish = useCallback(() => setSpin(null), []);

  if (!spin) return null;
  // Portalled to <body> so it covers the witch, spider and zombies, which
  // live outside the page content's stacking context
  return createPortal(
    <WheelOverlay key={spin.key} spin={spin} onDone={finish} />,
    document.body,
  );
}

function WheelOverlay({ spin, onDone }: { spin: Spin; onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const count = spin.players.length;
  const segment = 360 / count;
  const victim = spin.players[spin.winner];
  const victimColor = getUsernameColor(victim.username).bgColor;

  useEffect(() => {
    const overlay = overlayRef.current;
    const wheel = wheelRef.current;
    const pointer = pointerRef.current;
    if (!overlay || !wheel || !pointer) return;

    let alive = true;
    let frame = 0;

    const run = async () => {
      overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 600,
        fill: "forwards",
      });
      playIntro();
      await wait(1400);
      if (!alive) return;

      // Spin, decelerating, ticking as each segment passes the pointer
      const duration = prefersReducedMotion() ? 0 : SPIN_MS;
      await new Promise<void>((resolve) => {
        const begin = performance.now();
        let lastSegment = 0;
        let lastTick = 0;
        const step = (now: number) => {
          if (!alive) return resolve();
          const t = duration ? Math.min(1, (now - begin) / duration) : 1;
          const angle = spin.rotation * easeOutQuart(t);
          wheel.style.transform = `rotate(${angle}deg)`;

          const passed = Math.floor((angle + segment / 2) / segment);
          if (passed !== lastSegment) {
            lastSegment = passed;
            lastTick = now;
            if (duration) playTick();
          }
          // The pointer flicks back with each tick and settles
          const flick = Math.max(0, 1 - (now - lastTick) / 120);
          pointer.style.transform = `rotate(${-18 * flick}deg)`;

          if (t < 1) frame = requestAnimationFrame(step);
          else resolve();
        };
        frame = requestAnimationFrame(step);
      });
      if (!alive) return;

      setRevealed(true);
      playReveal();
      window.dispatchEvent(new Event(WHEEL_EVENT));
      window.dispatchEvent(new Event(SHOT_EVENT));
      const colors = ["#ff7a18", "#8b3dff", "#9dff3c", "#d3122a", "#f5eddc"];
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.55 },
        colors,
        zIndex: 70,
      });
      setTimeout(() => {
        if (!alive) return;
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 70,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 70,
        });
      }, 400);

      await wait(REVEAL_MS);
      if (!alive) return;
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 800,
        fill: "forwards",
      });
      await fade.finished.catch(() => {});
      if (alive) onDone();
    };
    run();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [spin, segment, onDone]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-[2vh] overflow-hidden px-4 opacity-0"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgb(48 19 82 / 0.97), rgb(11 6 18 / 0.985) 70%)",
      }}
      role="dialog"
      aria-live="assertive"
      aria-label="Wheel of Doom"
    >
      <div className="text-center">
        <h2 className="font-spooky text-5xl lg:text-[8vh] leading-none tracking-wide text-pumpkin text-glow-pumpkin animate-flicker">
          Wheel of Doom
        </h2>
        <p className="mt-[1vh] text-lg lg:text-[2.6vh] font-bold text-mist">
          {revealed
            ? "The spirits have chosen…"
            : "Who must take the next shot?"}
        </p>
      </div>

      <div className="relative aspect-square w-[min(58vh,86vw)]">
        {/* Rim and blinking bulbs stay still; only the wheel inside turns */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_80px_10px_rgb(139_61_255_/_0.45)]" />
        <div
          ref={wheelRef}
          className="absolute inset-[4%]"
          style={{ willChange: "transform" }}
        >
          <svg
            viewBox="-100 -100 200 200"
            className="size-full overflow-visible"
          >
            {spin.players.map((player, i) => {
              const a0 = i * segment;
              const a1 = (i + 1) * segment;
              const mid = a0 + segment / 2;
              const color = getUsernameColor(player.username).bgColor;
              const won = revealed && i === spin.winner;
              return (
                <g key={player.id}>
                  <path
                    d={`M0 0 L${point(a0, 100)} A100 100 0 ${segment > 180 ? 1 : 0} 1 ${point(a1, 100)} Z`}
                    fill={color}
                    stroke="#0b0612"
                    strokeWidth="1.2"
                  />
                  <text
                    transform={`rotate(${mid - 90}) translate(60 0)`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.min(11, 220 / count)}
                    fontWeight="800"
                    fill="#0b0612"
                  >
                    {player.username.length > 12
                      ? `${player.username.slice(0, 11)}…`
                      : player.username}
                  </text>
                  {revealed && !won && (
                    <path
                      d={`M0 0 L${point(a0, 100)} A100 100 0 ${segment > 180 ? 1 : 0} 1 ${point(a1, 100)} Z`}
                      fill="#0b0612"
                      fillOpacity="0.6"
                    />
                  )}
                </g>
              );
            })}
            <circle r="99" fill="none" stroke="#0b0612" strokeWidth="2" />
          </svg>
        </div>
        <svg
          viewBox="-100 -100 200 200"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <circle r="97" fill="none" stroke="#3a2553" strokeWidth="7" />
        </svg>
        {[0, 1].map((phase) => (
          <svg
            key={phase}
            viewBox="-100 -100 200 200"
            className="animate-bulb-blink pointer-events-none absolute inset-0 size-full overflow-visible"
            style={{ animationDelay: `${phase * -0.5}s` }}
          >
            {Array.from({ length: BULBS / 2 }, (_, i) => {
              const angle = ((i * 2 + phase) * 360) / BULBS;
              const [x, y] = point(angle, 97).split(" ");
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2.6"
                  fill={phase ? "#9dff3c" : "#ffb454"}
                />
              );
            })}
          </svg>
        ))}
        <Pumpkin className="absolute left-1/2 top-1/2 w-[20%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_12px_rgb(255_122_24_/_0.8)]" />
        {/* Blood-drip pointer at 12 o'clock */}
        <div
          ref={pointerRef}
          className="absolute left-1/2 top-[-5%] w-[9%] -translate-x-1/2 origin-top"
        >
          <svg
            viewBox="0 0 40 56"
            className="w-full drop-shadow-[0_3px_6px_rgb(0_0_0_/_0.7)]"
          >
            <path
              d="M4 4 H36 L20 50 Z"
              fill="#d3122a"
              stroke="#0b0612"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="12" r="5" fill="#8f0b1c" />
          </svg>
        </div>
      </div>

      <div className="flex min-h-[14vh] flex-col items-center text-center">
        {revealed && (
          <>
            <p
              className="animate-victim-slam font-spooky text-6xl lg:text-[10vh] leading-none tracking-wide"
              style={{
                color: victimColor,
                textShadow: `0 0 24px ${victimColor}, 0 0 60px rgb(211 18 42 / 0.6)`,
              }}
            >
              {victim.username}
            </p>
            <p className="animate-victim-slam mt-[1vh] text-xl lg:text-[3vh] font-bold text-bone [animation-delay:0.25s]">
              🩸 The spirits demand a shot! 🩸
            </p>
          </>
        )}
      </div>
    </div>
  );
}
