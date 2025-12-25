"use client";

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t load the leaderboard. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-linear-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-2xl hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
