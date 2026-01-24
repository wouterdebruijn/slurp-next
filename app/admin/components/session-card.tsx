"use client";

import { useState } from "react";
import { SessionsResponse } from "@/pocketbase-types";
import { updateSession, deleteSession } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SessionCard({
  session,
}: {
  session: SessionsResponse;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [shortcode, setShortcode] = useState(session.shortcode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleActive = async () => {
    setLoading(true);
    const result = await updateSession(session.id, {
      active: !session.active,
    });
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to update session");
    }
  };

  const handleUpdateShortcode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await updateSession(session.id, { shortcode });

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error || "Failed to update session");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this session? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await deleteSession(session.id);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete session");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleUpdateShortcode} className="space-y-2">
              <input
                type="text"
                value={shortcode}
                onChange={(e) => setShortcode(e.target.value.toUpperCase())}
                className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setShortcode(session.shortcode);
                    setError("");
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
          disabled={loading}
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

        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
