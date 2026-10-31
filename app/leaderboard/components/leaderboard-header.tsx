import { Pumpkin } from "@/app/components/halloween/spooky-art";
import SessionQrCode from "./session-qr-code";

interface LeaderboardHeaderProps {
  sessionId: string;
  sessionShortcode: string;
  isSessionActive: boolean;
}

export default function LeaderboardHeader({
  sessionId,
  sessionShortcode,
  isSessionActive,
}: LeaderboardHeaderProps) {
  return (
    <div className="mb-8 xl:mb-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
      <div className="flex items-center justify-center gap-4 xl:gap-6 mb-6 xl:mb-8 lg:mb-0 lg:col-start-2">
        <Pumpkin className="size-12 xl:size-22" />
        <div className="flex flex-col items-start">
          <h1 className="font-spooky text-4xl xl:text-7xl tracking-wide text-pumpkin text-glow-pumpkin animate-flicker">
            Leaderboo!
          </h1>
          <p className="text-lg xl:text-2xl text-slime text-glow-slime font-bold">
            {sessionShortcode}
          </p>
        </div>
      </div>

      {isSessionActive && (
        <SessionQrCode
          sessionId={sessionId}
          sessionShortcode={sessionShortcode}
        />
      )}
    </div>
  );
}
