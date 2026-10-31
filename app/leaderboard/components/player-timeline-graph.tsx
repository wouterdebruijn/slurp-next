"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayerEntries } from "@/app/actions/player-entries-actions";
import { hashStringToColor } from "@/utils/colorUtils";
import { SlimeDrips } from "@/app/components/halloween/spooky-art";
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
}

export default function PlayerTimelineGraph({
  sessionId,
}: PlayerTimelineGraphProps) {
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["player-entries", sessionId],
    queryFn: () => getPlayerEntries(sessionId),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-grave/95 border-3 border-hex rounded-2xl p-6 mb-8 lg:mb-0 lg:flex-1 lg:min-h-0">
        <h2 className="font-spooky text-3xl tracking-wide text-bone mb-4">
          Descent Into Madness
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-4xl animate-spin">🔮</div>
        </div>
      </div>
    );
  }

  if (error || !data || data.timelineData.length === 0) {
    return (
      <div className="bg-grave/95 border-3 border-hex rounded-2xl p-6 mb-8 lg:mb-0 lg:flex-1 lg:min-h-0">
        <h2 className="font-spooky text-3xl tracking-wide text-bone mb-4">
          Descent Into Madness
        </h2>
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
      <div className="flex items-center mb-6 xl:mb-8 short:mb-2">
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
      <div className="h-80 lg:h-auto lg:flex-1 lg:min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ left: -20, right: 10, top: 5, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="5 5"
              stroke="#5b3f7d"
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              ticks={timeTicks}
              tickFormatter={formatTime}
              stroke="#FFB454"
              strokeWidth={2}
              style={{ fontSize: "11px", fontWeight: "600" }}
              tick={{ fill: "#FFB454" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              // Headroom above the leader so their line doesn't hug the top edge
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15) || 1]}
              allowDecimals={false}
              stroke="#FFB454"
              strokeWidth={2}
              style={{ fontSize: "13px", fontWeight: "600" }}
              tick={{ fill: "#FFB454" }}
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
              labelStyle={{ color: "#FFB454", fontWeight: "700" }}
              labelFormatter={(time) => formatTime(Number(time))}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", fontWeight: "600" }}
              formatter={(value) => playerNames[value] || value}
            />
            {playerIds.map((playerId) => (
              <Line
                key={playerId}
                // A shot is an instant jump, not a gradual slope
                type="stepAfter"
                dataKey={playerId}
                stroke={playerColors[playerId]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                name={playerNames[playerId]}
                connectNulls
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
