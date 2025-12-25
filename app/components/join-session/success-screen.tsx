interface SuccessScreenProps {
  selectedSessionShortcode?: string;
}

export function SuccessScreen({
  selectedSessionShortcode,
}: SuccessScreenProps) {
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
