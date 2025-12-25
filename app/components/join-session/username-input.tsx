import { UseFormRegister, FieldErrors } from "react-hook-form";

interface UsernameInputProps {
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

export function UsernameInput({ register, errors }: UsernameInputProps) {
  return (
    <div>
      <label
        htmlFor="username"
        className="block text-sm font-bold text-gray-700 mb-2"
      >
        Your Name 🎮
      </label>
      <input
        id="username"
        type="text"
        placeholder="Enter your display name"
        {...register("username")}
        className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium"
      />
      {errors.username && (
        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
      )}
    </div>
  );
}
