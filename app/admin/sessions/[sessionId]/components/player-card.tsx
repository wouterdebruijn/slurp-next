"use client";

import { useState } from "react";
import { PlayersResponse } from "@/pocketbase-types";
import {
  addShotsToPlayer,
  removeShotsFromPlayer,
} from "@/app/actions/admin-actions";

export default function PlayerCard({
  player,
  shotCount,
  onShotsUpdated,
}: {
  player: PlayersResponse;
  shotCount: number | undefined;
  onShotsUpdated: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [shots, setShots] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddShots = async () => {
    if (shots <= 0) return;

    setLoading(true);
    setError("");

    const result = await addShotsToPlayer(player.id, shots);

    if (result.success) {
      setIsAdding(false);
      setShots(1);
      onShotsUpdated();
    } else {
      setError(result.error || "Failed to add shots");
    }

    setLoading(false);
  };

  const handleRemoveShots = async () => {
    if (shots <= 0) return;

    setLoading(true);
    setError("");

    const result = await removeShotsFromPlayer(player.id, shots);

    if (result.success) {
      setIsRemoving(false);
      setShots(1);
      onShotsUpdated();
    } else {
      setError(result.error || "Failed to remove shots");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white">{player.username}</h3>
        <p className="text-sm text-gray-400 mt-1">
          Hardware ID: {player.hardware_id || "N/A"}
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <p className="text-sm text-gray-400">Total Shots</p>
        <p className="text-3xl font-bold text-white mt-1">
          {shotCount ?? "—"}
        </p>
      </div>

      {!isAdding && !isRemoving && (
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Add Shots
          </button>
          <button
            onClick={() => setIsRemoving(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Remove Shots
          </button>
        </div>
      )}

      {(isAdding || isRemoving) && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of shots
            </label>
            <input
              type="number"
              min="1"
              value={shots}
              onChange={(e) =>
                setShots(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={isAdding ? handleAddShots : handleRemoveShots}
              disabled={loading}
              className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${
                isAdding
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {loading ? "Processing..." : isAdding ? "Add" : "Remove"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setIsRemoving(false);
                setShots(1);
                setError("");
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
