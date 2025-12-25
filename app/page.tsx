import { JoinSessionForm } from "./components/join-session-form";
import {
  getActiveSessions,
  getPlayerByHardwareId,
} from "./actions/session-actions";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { shotglasId } = await searchParams;

  // If shotglasId is provided, check for auto-redirect conditions
  if (shotglasId && typeof shotglasId === "string") {
    const [player, sessions] = await Promise.all([
      getPlayerByHardwareId(shotglasId),
      getActiveSessions(),
    ]);

    // If player exists and there's exactly one active session, redirect to leaderboard
    if (player && sessions.length === 1) {
      redirect(`/leaderboard?session=${player.session}&player=${player.id}`);
    }
  }

  return <JoinSessionForm shotglasId={shotglasId as string | undefined} />;
}
