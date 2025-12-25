interface CurrentPlayerStatsProps {
  rank: number;
  totalShots: number;
}

export default function CurrentPlayerStats({
  rank,
  totalShots,
}: CurrentPlayerStatsProps) {
  return (
    <div className="bg-yellow-50 rounded-2xl p-4 mb-6 border-3 border-green-400 animate-slide-in">
      <p className="text-sm text-gray-600 mb-1 text-center">Your Stats</p>
      <div className="flex justify-around items-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600">#{rank}</p>
          <p className="text-xs text-gray-600">Rank</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{totalShots}</p>
          <p className="text-xs text-gray-600">Total Shots</p>
        </div>
      </div>
    </div>
  );
}
