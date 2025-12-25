import { UseFormRegister, FieldErrors } from "react-hook-form";

interface Session {
  id: string;
  shortcode: string;
}

interface SessionSelectorProps {
  sessions?: Session[];
  isLoading: boolean;
  register: UseFormRegister<{
    username: string;
    hardwareId: string;
    sessionId: string;
  }>;
  errors: FieldErrors<{
    username: string;
    hardwareId: string;
    sessionId: string;
  }>;
}

export function SessionSelector({
  sessions,
  isLoading,
  register,
  errors,
}: SessionSelectorProps) {
  return (
    <div>
      <label
        htmlFor="sessionId"
        className="block text-sm font-bold text-gray-700 mb-2"
      >
        Select Session 🎯
      </label>
      {isLoading ? (
        <div className="px-4 py-3 border-3 border-yellow-300 rounded-2xl bg-yellow-50 text-gray-500 text-center">
          Loading sessions... 🔄
        </div>
      ) : sessions && sessions.length > 0 ? (
        <select
          id="sessionId"
          {...register("sessionId")}
          className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium bg-white"
        >
          <option value="">Choose a session...</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.shortcode}
            </option>
          ))}
        </select>
      ) : (
        <div className="px-4 py-3 border-3 border-red-300 rounded-2xl bg-red-50 text-red-600 text-center">
          No active sessions available 😢
        </div>
      )}
      {errors.sessionId && (
        <p className="text-red-500 text-sm mt-1">{errors.sessionId.message}</p>
      )}
    </div>
  );
}
