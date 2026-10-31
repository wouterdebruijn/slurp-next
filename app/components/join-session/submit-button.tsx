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
      className="w-full py-4 bg-linear-to-r from-ember to-pumpkin text-crypt font-spooky text-3xl tracking-wider rounded-2xl hover:from-pumpkin cursor-pointer hover:to-blood hover:text-bone active:scale-95 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_rgb(255_122_24_/_0.45)] hover:shadow-[0_0_36px_rgb(211_18_42_/_0.7)]"
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">🔮</span> Summoning...
        </span>
      ) : (
        "Join the Undead 🧟"
      )}
    </button>
  );
}
