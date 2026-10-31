"use client";

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 sm:p-6">
      <div className="bg-grave/95 border-3 border-blood glow-hex rounded-3xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="font-spooky text-4xl tracking-wide text-blood mb-2">
          The spirits are restless!
        </h2>
        <p className="text-mist mb-6">
          We couldn&apos;t load the leaderboard. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-linear-to-r from-ember to-pumpkin text-crypt font-bold rounded-2xl hover:from-pumpkin hover:to-blood hover:text-bone active:scale-95 transition-all cursor-pointer"
        >
          Retry the Ritual
        </button>
      </div>
    </div>
  );
}
