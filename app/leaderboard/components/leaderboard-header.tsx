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
    <div className="mb-8 xl:mb-12 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
      <div className="flex items-center justify-center gap-4 xl:gap-6 mb-6 xl:mb-8 lg:mb-0 lg:col-start-2">
        <div className="text-5xl xl:text-8xl">🏆</div>
        <div className="flex flex-col items-start">
          <h1 className="text-3xl xl:text-6xl font-bold text-gray-800">
            Leaderboard
          </h1>
          <p className="text-lg xl:text-3xl text-yellow-600 font-bold">
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
