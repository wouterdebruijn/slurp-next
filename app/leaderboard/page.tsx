import { redirect } from "next/navigation";
import LeaderboardClient from "./leaderboard-client";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { session, player } = await searchParams;

  const sessionId = typeof session === "string" ? session : null;
  const playerId = typeof player === "string" ? player : undefined;

  if (!sessionId) {
    redirect("/");
  }

  return <LeaderboardClient sessionId={sessionId} playerId={playerId} />;
}
