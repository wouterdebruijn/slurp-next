"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { SessionsResponse } from "@/pocketbase-types";
import { updateSession, deleteSession } from "@/app/actions/admin-actions";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export default function SessionCard({
  session,
}: {
  session: SessionsResponse;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const form = useForm({
    defaultValues: { shortcode: session.shortcode },
    onSubmit: async ({ value }) => {
      const result = await updateSession(session.id, {
        shortcode: value.shortcode,
      });
      if (result.success) {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["adminSessions"] });
      } else {
        form.setErrorMap({ onSubmit: result.error || "Failed to update" });
      }
    },
  });

  const handleToggleActive = async () => {
    setIsMutating(true);
    const result = await updateSession(session.id, {
      active: !session.active,
    });
    setIsMutating(false);

    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ["adminSessions"] });
    } else {
      alert(result.error || "Failed to update session");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this session? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsMutating(true);
    const result = await deleteSession(session.id);
    setIsMutating(false);

    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ["adminSessions"] });
    } else {
      alert(result.error || "Failed to delete session");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-2"
            >
              <form.Field
                name="shortcode"
                validators={{
                  onChange: ({ value }) =>
                    value.length < 1
                      ? "Required"
                      : value.length > 10
                        ? "Max 10 chars"
                        : undefined,
                }}
              >
                {(field) => (
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={10}
                  />
                )}
              </form.Field>
              <form.Subscribe selector={(state) => state.errors}>
                {(errors) =>
                  errors.length > 0 && (
                    <p className="text-red-400 text-xs">
                      {errors.join(", ")}
                    </p>
                  )
                }
              </form.Subscribe>
              <form.Subscribe selector={(state) => state.errorMap}>
                {(errorMap) =>
                  errorMap.onSubmit ? (
                    <p className="text-red-400 text-xs">
                      {String(errorMap.onSubmit)}
                    </p>
                  ) : null
                }
              </form.Subscribe>
              <div className="flex gap-2">
                <form.Subscribe
                  selector={(state) => state.isSubmitting}
                >
                  {(isSubmitting) => (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                  )}
                </form.Subscribe>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white font-mono">
                {session.shortcode}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Created {new Date(session.created).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              session.active
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {session.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
          >
            Rename
          </button>
        )}

        <button
          onClick={handleToggleActive}
          disabled={isMutating}
          className={`text-sm px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
            session.active
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {session.active ? "Deactivate" : "Activate"}
        </button>

        <Link
          href={`/admin/sessions/${session.id}`}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
        >
          Manage Players
        </Link>

        <Link
          href={`/leaderboard?session=${session.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded transition-colors"
        >
          View Leaderboard
        </Link>

        <button
          onClick={handleDelete}
          disabled={isMutating}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
