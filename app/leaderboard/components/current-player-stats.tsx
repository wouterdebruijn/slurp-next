interface CurrentPlayerStatsProps {
  rank: number;
  totalShots: number;
}

export default function CurrentPlayerStats({
  rank,
  totalShots,
}: CurrentPlayerStatsProps) {
  return (
    <div className="bg-grave/95 rounded-2xl p-4 mb-6 border-3 border-slime animate-slide-in">
      <p className="text-sm text-mist mb-1 text-center">Your Curse So Far 🕯️</p>
      <div className="flex justify-around items-center">
        <div className="text-center">
          <p className="font-spooky text-4xl tracking-wide text-pumpkin">
            #{rank}
          </p>
          <p className="text-xs text-mist">Rank</p>
        </div>
        <div className="text-center">
          <p className="font-spooky text-4xl tracking-wide text-slime">
            {totalShots}
          </p>
          <p className="text-xs text-mist">Total Shots</p>
        </div>
      </div>
    </div>
  );
}
