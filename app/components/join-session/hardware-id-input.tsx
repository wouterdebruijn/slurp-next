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
        className="block text-sm font-bold text-gray-700 mb-2"
      >
        Glass ID 🥃
      </label>
      <input
        id="hardwareId"
        type="text"
        placeholder="Enter your glass ID"
        {...register("hardwareId")}
        className="w-full px-4 py-3 border-3 border-yellow-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-gray-800 font-medium bg-white"
      />
      {errors.hardwareId && (
        <p className="text-red-500 text-sm mt-1">{errors.hardwareId.message}</p>
      )}
    </div>
  );
}
