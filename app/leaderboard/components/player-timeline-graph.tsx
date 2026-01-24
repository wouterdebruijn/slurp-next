"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayerEntries } from "@/app/actions/player-entries-actions";
import { hashStringToColor } from "@/utils/colorUtils";
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["player-entries", sessionId],
    queryFn: () => getPlayerEntries(sessionId),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Shot Progress Over Time
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-4xl animate-spin">📊</div>
        </div>
      </div>
    );
  }

  if (error || !data || data.timelineData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Shot Progress Over Time
        </h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No data available yet</p>
        </div>
      </div>
    );
  }

  const { timelineData, playerNames, lastPlayer } = data;

  // Get all player IDs from the data
  const playerIds = Object.keys(playerNames);

  // Fun praising sentences
  const praisePhrases = [
    "is on fire! 🔥",
    "is crushing it! 💪",
    "is a legend! ⭐",
    "is unstoppable! 🚀",
    "is the MVP! 🏆",
    "is showing everyone how it's done! 🎯",
    "just leveled up! 🎮",
    "is in beast mode! 🦁",
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

  // Format data for chart - format timestamps for display
  const formattedData = timelineData.map((entry) => {
    const date = new Date(entry.timestamp);

    return {
      ...entry,
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  return (
    <div className="bg-yellow-50 rounded-3xl p-6 xl:p-10 mb-8 border-3 border-yellow-300 shadow-xl">
      <div className="flex items-center mb-6 xl:mb-8">
        <span className="text-4xl xl:text-7xl">📈</span>
        <div className="inline-block ml-3 xl:ml-6">
          <h2 className="text-2xl xl:text-5xl font-bold text-gray-800">
            Shot Progress Over Time
          </h2>
          {lastPlayer && (
            <p className="text-sm xl:text-2xl text-yellow-600 font-semibold">
              {getRandomPraise(lastPlayer.username)}
            </p>
          )}
        </div>
      </div>
      <div className="h-80 xl:h-150">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ left: -20, right: 10, top: 5, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="5 5"
              stroke="#FDE68A"
              opacity={0.6}
            />
            <XAxis
              dataKey="time"
              stroke="#CA8A04"
              strokeWidth={2}
              style={{ fontSize: "11px", fontWeight: "600" }}
              tick={{ fill: "#CA8A04" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#CA8A04"
              strokeWidth={2}
              style={{ fontSize: "13px", fontWeight: "600" }}
              tick={{ fill: "#CA8A04" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFBEB",
                border: "3px solid #FBBF24",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#CA8A04", fontWeight: "700" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "10px", fontWeight: "600" }}
              formatter={(value) => playerNames[value] || value}
            />
            {playerIds.map((playerId) => (
              <Line
                key={playerId}
                type="monotone"
                dataKey={playerId}
                stroke={playerColors[playerId]}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                name={playerNames[playerId]}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
