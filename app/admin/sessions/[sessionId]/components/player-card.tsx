"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
  shotCount: number;
  onShotsUpdated: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const form = useForm({
    defaultValues: { shots: 1 },
    onSubmit: async ({ value }) => {
      const fn = isAdding ? addShotsToPlayer : removeShotsFromPlayer;
      const result = await fn(player.id, value.shots);
      if (result.success) {
        setIsAdding(false);
        setIsRemoving(false);
        form.reset();
        onShotsUpdated();
      } else {
        form.setErrorMap({ onSubmit: result.error || "Failed" });
      }
    },
  });

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
        <p className="text-3xl font-bold text-white mt-1">{shotCount}</p>
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of shots
            </label>
            <form.Field
              name="shots"
              validators={{
                onChange: ({ value }) =>
                  value < 1 ? "At least 1" : undefined,
              }}
              children={(field) => (
                <input
                  type="number"
                  min="1"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>

          <div className="flex gap-2">
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${
                    isAdding
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {isSubmitting ? "Saving..." : isAdding ? "Add" : "Remove"}
                </button>
              )}
            />
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setIsRemoving(false);
                form.reset();
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <form.Subscribe
            selector={(state) => state.errorMap.onSubmit}
            children={(err) =>
              err ? (
                <p className="text-red-500 text-sm">{String(err)}</p>
              ) : null
            }
          />
        </form>
      )}
    </div>
  );
}
