"use client";

import { useState } from "react";
import { PlayersResponse, EntriesResponse } from "@/pocketbase-types";
import PlayersList from "./players-list";
import EntriesList from "./entries-list";

type Tab = "players" | "entries";

interface SessionTabsProps {
  sessionId: string;
  initialPlayers: PlayersResponse[];
  initialEntries: (EntriesResponse & {
    expand?: {
      player?: {
        id: string;
        username: string;
        session: string;
      };
    };
  })[];
}

export default function SessionTabs({
  sessionId,
  initialPlayers,
  initialEntries,
}: SessionTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("players");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("players")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "players"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("entries")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "entries"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Entries
          </button>
        </nav>
      </div>

      {activeTab === "players" && (
        <PlayersList sessionId={sessionId} initialPlayers={initialPlayers} />
      )}

      {activeTab === "entries" && (
        <EntriesList initialEntries={initialEntries} />
      )}
    </div>
  );
}
