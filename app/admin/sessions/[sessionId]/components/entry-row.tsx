"use client";

import { useState } from "react";
import { EntriesResponse } from "@/pocketbase-types";
import { updateEntryUnits, deleteEntry } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";

interface EntryRowProps {
  entry: EntriesResponse & {
    expand?: {
      player?: {
        id: string;
        username: string;
        session: string;
      };
    };
  };
}

export default function EntryRow({ entry }: EntryRowProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [unitsInput, setUnitsInput] = useState(entry.units.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    const parsedUnits = parseInt(unitsInput);
    if (isNaN(parsedUnits)) {
      setError("Invalid number");
      setLoading(false);
      return;
    }

    const result = await updateEntryUnits(entry.id, parsedUnits);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error || "Failed to update entry");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    setLoading(true);
    const result = await deleteEntry(entry.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete entry");
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <tr className="hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-white font-medium">
          {entry.expand?.player?.username || "Unknown"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={unitsInput}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string, minus sign, and valid numbers
                if (value === "" || value === "-" || /^-?\d+$/.test(value)) {
                  setUnitsInput(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setUnitsInput(entry.units.toString());
                  setError("");
                }
              }}
              onBlur={handleSave}
              autoFocus
              className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {error && <span className="text-red-400 text-xs">{error}</span>}
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={`font-mono cursor-pointer hover:bg-gray-700 px-2 py-1 rounded transition-colors ${
              entry.units < 0 ? "text-red-400" : "text-green-400"
            }`}
            title="Click to edit"
          >
            {entry.units}
          </button>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            entry.hide
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {entry.hide ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            entry.giveable
              ? "bg-blue-500/20 text-blue-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {entry.giveable ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
        {formatDate(entry.created)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUnitsInput(entry.units.toString());
                  setError("");
                }}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
