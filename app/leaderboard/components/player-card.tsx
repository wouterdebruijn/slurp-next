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
  hardwareId?: number;
}

export default function PlayerCard({
  rank,
  username,
  totalShots,
  isCurrentPlayer,
  index,
  hardwareId,
}: PlayerCardProps) {
  const rankEmoji = RANK_EMOJIS[rank as keyof typeof RANK_EMOJIS];

  // Each player glows in their own color, which also matches their graph line
  const userColor = getUsernameColor(username).bgColor;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl xl:rounded-3xl transition-all hover:scale-102
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
      <div className="p-4 xl:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 xl:gap-6 flex-1">
          {/* Rank */}
          <div className="font-spooky text-3xl xl:text-4xl tracking-wide text-bone min-w-15 xl:min-w-20 text-center">
            {rankEmoji || `#${rank}`}
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h3
              className="text-xl xl:text-2xl font-bold"
              style={{ color: userColor }}
            >
              {username}
              {isCurrentPlayer && " (You)"}
              {rankEmoji && <span className="animate-pulse"> 🦇</span>}
            </h3>
            {hardwareId !== undefined && (
              <p className="text-[10px] xl:text-xs text-mist/70 mt-0.5">
                #{hardwareId}
              </p>
            )}
          </div>

          {/* Total Score */}
          <div className="text-right">
            <div className="font-spooky text-3xl xl:text-4xl leading-none tracking-wide text-bone">
              {totalShots}
            </div>
            <div className="text-xs xl:text-base text-mist">shots</div>
          </div>
        </div>
      </div>
    </div>
  );
}
