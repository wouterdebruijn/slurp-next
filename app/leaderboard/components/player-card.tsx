import { getUsernameColor } from "@/utils/colorUtils";

const RANK_EMOJIS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
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
  const rankEmoji = RANK_EMOJIS[rank as keyof typeof RANK_EMOJIS];

  // Get color for all players based on username
  const userColor = getUsernameColor(username);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl xl:rounded-3xl shadow-lg transition-all hover:scale-102 hover:shadow-xl
        bg-white border-2 border-gray-200
        ${isCurrentPlayer ? "ring-4 ring-green-400" : ""}
      `}
      style={{
        animation: `slide-in ${0.2 + index * 0.05}s ease-out`,
        background: userColor.bgColor,
      }}
    >
      <div className="p-4 xl:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 xl:gap-6 flex-1">
          {/* Rank */}
          <div
            className="text-3xl xl:text-4xl font-bold text-white min-w-15 xl:min-w-20 text-center"
            style={{
              textShadow: rankEmoji
                ? "0 2px 4px rgba(0, 0, 0, 0.5)"
                : undefined,
            }}
          >
            {rankEmoji || `#${rank}`}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3 className="text-xl xl:text-2xl font-bold text-white">
              {username}
              {isCurrentPlayer && " (You)"}
            </h3>
          </div>

          {/* Total Score */}
          <div className="text-right">
            <div className="text-3xl xl:text-4xl font-bold text-white">
              {totalShots}
            </div>
            <div className="text-xs xl:text-base text-white/90">shots</div>
          </div>
        </div>
      </div>

      {/* Sparkle Effect for Top 3 */}
      {rankEmoji && (
        <div className="absolute top-2 xl:top-3 right-2 xl:right-3 text-2xl xl:text-3xl animate-pulse">
          ✨
        </div>
      )}
    </div>
  );
}
