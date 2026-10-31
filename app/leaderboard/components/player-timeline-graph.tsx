"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayerEntries } from "@/app/actions/player-entries-actions";
import { hashStringToColor } from "@/utils/colorUtils";
import { SlimeDrips, SpiderWeb } from "@/app/components/halloween/spooky-art";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlayerTimelineGraphProps {
  sessionId: string;
  topThreePlayers?: { id: string; rank: number }[];
  /** Shown to the right of the title, e.g. what's playing */
  headerAside?: React.ReactNode;
}

// Sits beside the title with room to breathe; wraps under it when it won't fit
const ASIDE_CLASS =
  "ml-auto min-w-0 flex-1 basis-[18rem] max-w-[26rem] xl:max-w-[30rem] short:max-w-[26rem]";

const RANK_MARKERS: Record<number, string> = { 1: "🎃", 2: "👻", 3: "💀" };

const SPOOKY_TICK = {
  fill: "#f5eddc",
  fontFamily: "var(--font-creepster)",
  letterSpacing: "0.05em",
};

export default function PlayerTimelineGraph({
  sessionId,
  topThreePlayers = [],
  headerAside,
}: PlayerTimelineGraphProps) {
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["player-entries", sessionId],
    queryFn: () => getPlayerEntries(sessionId),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-grave/95 border-3 border-hex rounded-2xl p-6 mb-8 lg:mb-0 lg:flex-1 lg:min-h-0">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-4">
          <h2 className="font-spooky text-3xl tracking-wide text-bone">
            Descent Into Madness
          </h2>
          {headerAside && <div className={ASIDE_CLASS}>{headerAside}</div>}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-4xl animate-spin">🔮</div>
        </div>
      </div>
    );
  }

  if (error || !data || data.timelineData.length === 0) {
    return (
      <div className="bg-grave/95 border-3 border-hex rounded-2xl p-6 mb-8 lg:mb-0 lg:flex-1 lg:min-h-0">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-4">
          <h2 className="font-spooky text-3xl tracking-wide text-bone">
            Descent Into Madness
          </h2>
          {headerAside && <div className={ASIDE_CLASS}>{headerAside}</div>}
        </div>
        <div className="flex items-center justify-center h-64 text-mist">
          <p>No souls claimed yet...</p>
        </div>
      </div>
    );
  }

  const { timelineData, playerNames, lastPlayer } = data;

  // Get all player IDs from the data
  const playerIds = Object.keys(playerNames);

  // Fun praising sentences
  const praisePhrases = [
    "has risen from the grave! 🧟",
    "is out for blood! 🧛",
    "is howling at the moon! 🐺",
    "is possessed! 😈",
    "is scaring the living! 👻",
    "just sold their soul! 🔥",
    "has been cursed! 🔮",
    "is brewing up trouble! 🧪",
  ];

  const getRandomPraise = (name: string) => {
    const index = name.length % praisePhrases.length;
    return `${name} ${praisePhrases[index]}`;
  };

  // Assign colors to players based on username hash
  const playerColors: Record<string, string> = {};
  playerIds.forEach((playerId) => {
    playerColors[playerId] = hashStringToColor(playerNames[playerId]);
  });

  const formatTime = (time: number) =>
    new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Plot on a real time axis (PocketBase timestamps use a space, not a "T")
  const formattedData = timelineData.map((entry) => ({
    ...entry,
    time: Date.parse(entry.timestamp.replace(" ", "T")),
  }));

  // Carry every line on to the last fetch, otherwise the latest shot is only a
  // vertical tick at the right edge of a step chart
  const lastPoint = formattedData[formattedData.length - 1];
  formattedData.push({
    ...lastPoint,
    time: Math.max(dataUpdatedAt, lastPoint.time),
  });

  const lastIndex = formattedData.length - 1;
  const rankByPlayer = Object.fromEntries(
    topThreePlayers.map(({ id, rank }) => [id, rank]),
  );
  // Tied players end on the same point: step the lower ranks' markers left
  const lastValues = formattedData[lastIndex] as Record<string, unknown>;
  const markerShift = Object.fromEntries(
    topThreePlayers.map(({ id, rank }) => [
      id,
      topThreePlayers.filter(
        (other) => other.rank < rank && lastValues[other.id] === lastValues[id],
      ).length * -30,
    ]),
  );

  // Evenly spaced time labels rather than one per entry, which bunch up
  const startTime = formattedData[0].time;
  const endTime = formattedData[formattedData.length - 1].time;
  const timeTicks = Array.from(
    { length: 6 },
    (_, i) => startTime + ((endTime - startTime) * i) / 5,
  );

  return (
    <div className="relative bg-grave rounded-3xl p-6 pt-8 xl:p-10 xl:pt-12 short:p-6 short:pt-8 mb-8 lg:mb-0 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col border-3 border-hex glow-hex">
      <SlimeDrips />
      <div className="flex flex-wrap items-center gap-x-8 xl:gap-x-12 gap-y-4 mb-6 xl:mb-8 short:mb-2">
        <div className="flex shrink-0 items-center">
          <span className="text-4xl xl:text-7xl short:text-4xl">🕸️</span>
          <div className="inline-block ml-3 xl:ml-6 short:ml-3">
            <h2 className="font-spooky text-3xl xl:text-6xl short:text-3xl tracking-wide text-bone">
              Descent Into Madness
            </h2>
            {lastPlayer && (
              <p className="text-sm xl:text-2xl short:text-base text-slime text-glow-slime font-semibold">
                {getRandomPraise(lastPlayer.username)}
              </p>
            )}
          </div>
        </div>
        {headerAside && <div className={ASIDE_CLASS}>{headerAside}</div>}
      </div>
      <div className="relative h-80 lg:h-auto lg:flex-1 lg:min-h-0">
        <SpiderWeb className="absolute right-0 top-0 h-3/4 aspect-square -scale-x-100 opacity-15 pointer-events-none" />
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ left: 0, right: 24, top: 18, bottom: 20 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 8"
              stroke="#8b3dff"
              opacity={0.45}
            />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              ticks={timeTicks}
              tickFormatter={formatTime}
              stroke="#ff7a18"
              strokeWidth={2}
              tickLine={false}
              style={{ fontSize: "15px" }}
              tick={SPOOKY_TICK}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              // Headroom above the leader so their line doesn't hug the top edge
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15) || 1]}
              allowDecimals={false}
              stroke="#ff7a18"
              strokeWidth={2}
              tickLine={false}
              style={{ fontSize: "18px" }}
              tick={SPOOKY_TICK}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1026",
                border: "3px solid #8B3DFF",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.6)",
              }}
              labelStyle={{
                color: "#ff7a18",
                fontFamily: "var(--font-creepster)",
                fontSize: "18px",
                letterSpacing: "0.05em",
              }}
              labelFormatter={(time) => formatTime(Number(time))}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", fontWeight: "600" }}
              formatter={(value) => playerNames[value] || value}
            />
            {/* Wide faint copies under every line: a glow without an SVG filter */}
            {playerIds.map((playerId) => (
              <Line
                key={`${playerId}-glow`}
                type="stepAfter"
                dataKey={playerId}
                stroke={playerColors[playerId]}
                strokeWidth={10}
                strokeOpacity={0.18}
                dot={false}
                activeDot={false}
                legendType="none"
                tooltipType="none"
                connectNulls
                isAnimationActive={false}
              />
            ))}
            {playerIds.map((playerId) => (
              <Line
                key={playerId}
                // A shot is an instant jump, not a gradual slope
                type="stepAfter"
                dataKey={playerId}
                stroke={playerColors[playerId]}
                strokeWidth={3}
                // The top three carry their rank emoji at the head of their line
                dot={(props) =>
                  props.index === lastIndex && rankByPlayer[playerId] ? (
                    <text
                      key={`${playerId}-marker`}
                      x={(props.cx ?? 0) + markerShift[playerId]}
                      y={props.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={26}
                    >
                      {RANK_MARKERS[rankByPlayer[playerId]]}
                    </text>
                  ) : (
                    <g key={`${playerId}-${props.index}`} />
                  )
                }
                activeDot={{ r: 6, strokeWidth: 0 }}
                name={playerNames[playerId]}
                connectNulls
                // The data changes on every refetch; re-animating all lines each
                // time is the heaviest thing on the page for a TV
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
