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

const RANK_COLORS_HEX = {
  1: "#FBBF24", // yellow-400
  2: "#D1D5DB", // gray-300
  3: "#FB923C", // orange-400
};

export default function PlayerTimelineGraph({
  sessionId,
  topThreePlayers = [],
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

  const { timelineData, playerNames } = data;

  // Get all player IDs from the data
  const playerIds = Object.keys(playerNames);

  // Assign colors to players
  const playerColors: Record<string, string> = {};
  playerIds.forEach((playerId) => {
    const topPlayerRank = topThreePlayers.find((p) => p.id === playerId)?.rank;
    if (topPlayerRank && topPlayerRank <= 3) {
      playerColors[playerId] =
        RANK_COLORS_HEX[topPlayerRank as keyof typeof RANK_COLORS_HEX];
    } else {
      playerColors[playerId] = hashStringToColor(playerNames[playerId]);
    }
  });

  // Format data for chart - format timestamps for display
  const formattedData = timelineData.map((entry) => {
    const date = new Date(entry.timestamp);
    const isToday = date.toDateString() === new Date().toDateString();

    return {
      ...entry,
      time: isToday
        ? date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🍺 Shot Progress Over Time
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: "12px" }}
            label={{
              value: "Total Shots",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: "12px", fill: "#9CA3AF" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #FBBF24",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => playerNames[value] || value}
          />
          {playerIds.map((playerId) => (
            <Line
              key={playerId}
              type="monotone"
              dataKey={playerId}
              stroke={playerColors[playerId]}
              strokeWidth={2}
              dot={{ r: 3 }}
              name={playerNames[playerId]}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
