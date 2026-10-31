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
        className="block font-spooky text-xl tracking-wide text-ember mb-2"
      >
        Choose Your Séance 🔮
      </label>
      {isLoading ? (
        <div className="px-4 py-3 border-3 border-tomb rounded-2xl bg-crypt text-mist text-center">
          Summoning sessions... 🕯️
        </div>
      ) : sessions && sessions.length > 0 ? (
        <select
          id="sessionId"
          {...register("sessionId")}
          className="w-full px-4 py-3 border-3 border-tomb rounded-2xl focus:outline-none focus:ring-4 focus:ring-pumpkin/50 focus:border-pumpkin transition-all text-bone font-medium bg-crypt"
        >
          <option value="">Choose a séance...</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.shortcode}
            </option>
          ))}
        </select>
      ) : (
        <div className="px-4 py-3 border-3 border-blood rounded-2xl bg-blood/20 text-red-200 text-center">
          No active sessions... the spirits are sleeping 💤
        </div>
      )}
      {errors.sessionId && (
        <p className="text-red-400 text-sm mt-1">{errors.sessionId.message}</p>
      )}
    </div>
  );
}
