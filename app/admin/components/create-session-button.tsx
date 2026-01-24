"use client";

import { useState } from "react";
import { createSession } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";

export default function CreateSessionButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [shortcode, setShortcode] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createSession({ shortcode, active });

      if (result.success) {
        setIsOpen(false);
        setShortcode("");
        setActive(true);
        router.refresh();
      } else {
        setError(result.error || "Failed to create session");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Create Session
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">
          Create New Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="shortcode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Session Shortcode
            </label>
            <input
              id="shortcode"
              type="text"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value.toUpperCase())}
              required
              maxLength={10}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              placeholder="SLURP2025"
            />
          </div>

          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-300">
              Active (players can join)
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
