"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EntriesResponse } from "@/pocketbase-types";
import { updateEntryUnits, deleteEntry } from "@/app/actions/admin-actions";
import { useQueryClient } from "@tanstack/react-query";

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
  sessionId: string;
}

export default function EntryRow({ entry, sessionId }: EntryRowProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const form = useForm({
    defaultValues: { units: entry.units.toString() },
    onSubmit: async ({ value }) => {
      const parsed = parseInt(value.units, 10);
      if (isNaN(parsed)) {
        form.setErrorMap({ onSubmit: "Invalid number" });
        return;
      }
      const result = await updateEntryUnits(entry.id, parsed);
      if (result.success) {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["sessionEntries", sessionId] });
      } else {
        form.setErrorMap({ onSubmit: result.error || "Failed to update" });
      }
    },
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    setDeleteLoading(true);
    const result = await deleteEntry(entry.id);

    if (result.success) {
      await queryClient.invalidateQueries({
        queryKey: ["sessionEntries", sessionId],
      });
    } else {
      alert(result.error || "Failed to delete entry");
    }

    setDeleteLoading(false);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="flex items-center gap-2">
              <form.Field
                name="units"
                validators={{
                  onChange: ({ value }) => {
                    if (value === "" || value === "-") return undefined;
                    return /^-?\d+$/.test(value)
                      ? undefined
                      : "Must be a valid integer";
                  },
                }}
                children={(field) => (
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={() => form.handleSubmit()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        form.handleSubmit();
                      }
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        form.reset();
                      }
                    }}
                    autoFocus
                    className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                )}
              />
              <form.Subscribe
                selector={(state) => [
                  state.fieldMeta.units?.errors,
                  state.errorMap.onSubmit,
                ]}
                children={([fieldErrors, submitError]) => {
                  const error =
                    (Array.isArray(fieldErrors) && fieldErrors[0]) ||
                    submitError;
                  return error ? (
                    <span className="text-red-400 text-xs">
                      {String(error)}
                    </span>
                  ) : null;
                }}
              />
            </div>
          </form>
        ) : (
          <button
            onClick={() => {
              form.reset();
              setIsEditing(true);
            }}
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
                  form.reset();
                }}
                className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
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
