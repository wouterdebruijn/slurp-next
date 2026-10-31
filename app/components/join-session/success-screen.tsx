"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface SuccessScreenProps {
  selectedSessionShortcode?: string;
}

export function SuccessScreen({
  selectedSessionShortcode,
}: SuccessScreenProps) {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const scalar = 3;
    const shapes = ["🎃", "👻", "🦇", "💀", "🕷️"].map((text) =>
      confetti.shapeFromText({ text, scalar }),
    );
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 50,
      shapes,
      scalar,
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 12 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 sm:p-6">
      <div className="bg-crypt/60 sm:bg-grave/95 sm:border-3 sm:border-hex sm:glow-hex rounded-none sm:rounded-3xl p-6 sm:p-8 max-w-md w-full min-h-screen sm:min-h-0 text-center transform animate-bounce-in">
        <div className="text-6xl mb-4">🧟</div>
        <h2 className="font-spooky text-5xl tracking-wide text-slime text-glow-slime mb-2">
          There&apos;s no escape now!
        </h2>
        <p className="text-mist mb-6">Dragging you to the leaderboard...</p>
        <div className="bg-crypt rounded-2xl p-6 border-4 border-pumpkin">
          <p className="text-sm text-mist mb-2">Your séance</p>
          <p className="text-2xl font-bold text-pumpkin">
            {selectedSessionShortcode}
          </p>
        </div>
        <div className="mt-6">
          <div className="animate-spin text-4xl">🔮</div>
        </div>
      </div>
    </div>
  );
}
