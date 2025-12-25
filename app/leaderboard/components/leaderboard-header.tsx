interface LeaderboardHeaderProps {
  sessionShortcode: string;
}

export default function LeaderboardHeader({
  sessionShortcode,
}: LeaderboardHeaderProps) {
  return (
    <div className="text-center mb-8 xl:mb-12">
      <div className="flex items-center justify-center gap-4 xl:gap-6 mb-6 xl:mb-8">
        <div className="text-5xl xl:text-8xl">🏆</div>
        <div className="flex flex-col items-start">
          <h1 className="text-3xl xl:text-6xl font-bold text-gray-800">
            Leaderboard
          </h1>
          <p className="text-lg xl:text-3xl text-yellow-600 font-bold">
            {sessionShortcode}
          </p>
        </div>
      </div>
    </div>
  );
}
