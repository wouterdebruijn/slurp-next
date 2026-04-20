"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { adminLogin } from "@/app/actions/admin-actions";

export default function AdminLoginPage() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      const result = await adminLogin(value.email, value.password);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        form.setErrorMap({ onSubmit: result.error || "Login failed" });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Sign in to access the admin dashboard
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value.includes("@") ? "Valid email required" : undefined,
                }}
                children={(field) => (
                  <>
                    <input
                      id="email"
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="admin@example.com"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <form.Field
                name="password"
                children={(field) => (
                  <>
                    <input
                      id="password"
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <form.Subscribe
              selector={(state) => state.errorMap.onSubmit}
              children={(err) =>
                err ? (
                  <div className="bg-red-50 border border-red-300 rounded p-3 text-red-600 text-sm mb-4">
                    {String(err)}
                  </div>
                ) : null
              }
            />

            <form.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              )}
            />
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Only authorized administrators can access this area
        </p>
      </div>
    </div>
  );
}
