interface Session {
  id: string;
  shortcode: string;
}

interface SubmitButtonProps {
  isPending: boolean;
  isLoading: boolean;
  sessions?: Session[];
}

export function SubmitButton({
  isPending,
  isLoading,
  sessions,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending || isLoading || !sessions || sessions.length === 0}
      className="w-full py-4 bg-linear-to-r from-yellow-400 to-yellow-500 text-white text-xl font-bold rounded-2xl hover:from-yellow-500 cursor-pointer hover:to-yellow-600 active:scale-95 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⚡</span> Joining...
        </span>
      ) : (
        "Join Session 🚀"
      )}
    </button>
  );
}
