import { Pumpkin } from "@/app/components/halloween/spooky-art";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Pumpkin className="size-24 mb-4 animate-bounce" />
      <p className="font-spooky text-3xl tracking-wide text-bone">
        Summoning the leaderboard...
      </p>
    </div>
  );
}
