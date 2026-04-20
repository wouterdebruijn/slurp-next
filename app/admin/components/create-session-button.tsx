"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createSession } from "@/app/actions/admin-actions";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateSessionButton() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    defaultValues: { shortcode: "", active: true },
    onSubmit: async ({ value }) => {
      const result = await createSession({
        shortcode: value.shortcode,
        active: value.active,
      });
      if (result.success) {
        setIsOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["adminSessions"] });
      } else {
        form.setErrorMap({ onSubmit: result.error || "Failed to create session" });
      }
    },
  });

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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="shortcode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Session Shortcode
            </label>
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
              children={(field) => (
                <>
                  <input
                    id="shortcode"
                    type="text"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toUpperCase())
                    }
                    onBlur={field.handleBlur}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="SLURP2025"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-red-500 text-sm">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="flex items-center">
            <form.Field
              name="active"
              children={(field) => (
                <input
                  id="active"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
              )}
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-300">
              Active (players can join)
            </label>
          </div>

          <form.Subscribe
            selector={(state) => state.errorMap.onSubmit}
            children={(err) =>
              err ? (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                  {String(err)}
                </div>
              ) : null
            }
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                form.reset();
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
