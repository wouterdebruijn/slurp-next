import { UseFormRegister, FieldErrors } from "react-hook-form";

interface HardwareIdInputProps {
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

export function HardwareIdInput({ register, errors }: HardwareIdInputProps) {
  return (
    <div>
      <label
        htmlFor="hardwareId"
        className="block font-spooky text-xl tracking-wide text-ember mb-2"
      >
        Cursed Glass ID 🧪
      </label>
      <input
        id="hardwareId"
        type="text"
        placeholder="Enter your glass ID"
        {...register("hardwareId")}
        className="w-full px-4 py-3 border-3 border-tomb rounded-2xl focus:outline-none focus:ring-4 focus:ring-pumpkin/50 focus:border-pumpkin transition-all text-bone placeholder:text-mist/60 font-medium bg-crypt"
      />
      {errors.hardwareId && (
        <p className="text-red-400 text-sm mt-1">{errors.hardwareId.message}</p>
      )}
    </div>
  );
}
