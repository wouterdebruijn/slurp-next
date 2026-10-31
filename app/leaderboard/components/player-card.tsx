import { getUsernameColor } from "@/utils/colorUtils";

const RANK_EMOJIS = {
  1: "🎃",
  2: "👻",
  3: "💀",
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

  // Each player glows in their own color, which also matches their graph line
  const userColor = getUsernameColor(username).bgColor;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl lg:rounded-[1.6vh] lg:h-full transition-all hover:scale-102
        border-2
        ${isCurrentPlayer ? "ring-4 ring-slime" : ""}
      `}
      style={{
        animation: `slide-in ${0.2 + index * 0.05}s ease-out`,
        background: `linear-gradient(90deg, color-mix(in srgb, ${userColor} 28%, #1a1026), #1a1026 65%)`,
        borderColor: userColor,
        boxShadow: `0 0 18px color-mix(in srgb, ${userColor} 40%, transparent)`,
      }}
    >
      <div className="p-4 lg:py-0 lg:px-[2vh] lg:h-full flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-[2vh] flex-1">
          {/* Rank */}
          <div className="font-spooky text-3xl lg:text-[4vh] tracking-wide text-bone min-w-15 lg:min-w-[8vh] text-center">
            {rankEmoji || `#${rank}`}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3
              className="text-xl lg:text-[3.2vh] lg:leading-tight font-bold"
              style={{ color: userColor }}
            >
              {username}
              {isCurrentPlayer && " (You)"}
              {rankEmoji && <span className="animate-pulse"> 🦇</span>}
            </h3>
          </div>

          {/* Total Score */}
          <div className="font-spooky text-4xl lg:text-[4.4vh] leading-none tracking-wide text-bone text-right">
            {totalShots}
          </div>
        </div>
      </div>
    </div>
  );
}
