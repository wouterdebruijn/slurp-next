const RANK_EMOJIS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const RANK_COLORS = {
  1: "from-yellow-400 to-yellow-500",
  2: "from-gray-300 to-gray-400",
  3: "from-orange-400 to-orange-500",
};

const RANK_BORDER = {
  1: "border-yellow-400",
  2: "border-gray-400",
  3: "border-orange-400",
};

interface PlayerCardProps {
  rank: number;
  username: string;
  totalShots: number;
  isCurrentPlayer: boolean;
  index: number;
}

export default function PlayerCard({
  rank,
  username,
  totalShots,
  isCurrentPlayer,
  index,
}: PlayerCardProps) {
  const isTop3 = rank <= 3;
  const rankEmoji = RANK_EMOJIS[rank as keyof typeof RANK_EMOJIS];
  const rankColor = RANK_COLORS[rank as keyof typeof RANK_COLORS];
  const rankBorder = RANK_BORDER[rank as keyof typeof RANK_BORDER];

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl
        ${
          isTop3
            ? `bg-linear-to-r ${rankColor} border-4 ${rankBorder}`
            : "bg-white"
        }
        ${isCurrentPlayer ? "ring-4 ring-green-400" : ""}
      `}
      style={{
        animation: `slide-in ${0.2 + index * 0.05}s ease-out`,
      }}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Rank */}
          <div
            className={`text-3xl font-bold ${
              isTop3 ? "text-white" : "text-gray-700"
            } min-w-15 text-center`}
          >
            {rankEmoji || `#${rank}`}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3
              className={`text-xl font-bold ${
                isTop3 ? "text-white" : "text-gray-800"
              }`}
            >
              {username}
              {isCurrentPlayer && " (You)"}
            </h3>
          </div>

          {/* Total Score */}
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                isTop3 ? "text-white" : "text-yellow-600"
              }`}
            >
              {totalShots}
            </div>
            <div
              className={`text-xs ${
                isTop3 ? "text-white/90" : "text-gray-600"
              }`}
            >
              shots
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Sparkle Effect */}
      {isTop3 && (
        <div className="absolute top-2 right-2 text-2xl animate-pulse">✨</div>
      )}
    </div>
  );
}
