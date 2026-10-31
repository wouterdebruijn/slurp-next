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
        className="block font-spooky text-xl tracking-wide text-ember mb-2"
      >
        Your Ghoul Name 🧛
      </label>
      <input
        id="username"
        type="text"
        placeholder="Enter your display name"
        {...register("username")}
        className="w-full px-4 py-3 border-3 border-tomb rounded-2xl focus:outline-none focus:ring-4 focus:ring-pumpkin/50 focus:border-pumpkin transition-all text-bone placeholder:text-mist/60 font-medium bg-crypt"
      />
      {errors.username && (
        <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
      )}
    </div>
  );
}
