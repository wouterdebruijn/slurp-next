interface LeaderboardHeaderProps {
  sessionShortcode: string;
}

export default function LeaderboardHeader({
  sessionShortcode,
}: LeaderboardHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="text-5xl">🏆</div>
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
          <p className="text-lg text-yellow-600 font-bold">
            {sessionShortcode}
          </p>
        </div>
      </div>
    </div>
  );
}
