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
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          You&apos;re in!
        </h2>
        <p className="text-gray-600 mb-6">Redirecting to the leaderboard...</p>
        <div className="bg-yellow-100 rounded-2xl p-6 border-4 border-yellow-300">
          <p className="text-sm text-gray-500 mb-2">Your drinking session</p>
          <p className="text-2xl font-bold text-yellow-600">
            {selectedSessionShortcode}
          </p>
        </div>
        <div className="mt-6">
          <div className="animate-spin text-4xl">⚡</div>
        </div>
      </div>
    </div>
  );
}
