import { getSessionPlayers } from "@/app/actions/admin-actions";
import { getAllSessions } from "@/app/actions/admin-actions";
import { notFound } from "next/navigation";
import PlayersList from "./components/players-list";
import Link from "next/link";

export default async function SessionPlayersPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const [players, sessions] = await Promise.all([
    getSessionPlayers(sessionId),
    getAllSessions(),
  ]);

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            Manage Players - {session.shortcode}
          </h1>
          <p className="text-gray-400 mt-1">
            Add or remove shots for players in this session
          </p>
        </div>
      </div>

      <PlayersList sessionId={sessionId} initialPlayers={players} />
    </div>
  );
}
