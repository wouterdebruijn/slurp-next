import { getAllSessions } from "@/app/actions/admin-actions";
import SessionsList from "./components/sessions-list";
import CreateSessionButton from "./components/create-session-button";

export default async function AdminPage() {
  const sessions = await getAllSessions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Session Management</h1>
          <p className="text-gray-400 mt-1">
            Manage game sessions and player statistics
          </p>
        </div>
        <CreateSessionButton />
      </div>

      <SessionsList initialSessions={sessions} />
    </div>
  );
}
