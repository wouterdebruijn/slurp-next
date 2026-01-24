"use client";

import { useState } from "react";
import { SessionsResponse } from "@/pocketbase-types";
import SessionCard from "./session-card";

export default function SessionsList({
  initialSessions,
}: {
  initialSessions: SessionsResponse[];
}) {
  const [sessions] = useState(initialSessions);

  const activeSessions = sessions.filter((s) => s.active);
  const inactiveSessions = sessions.filter((s) => !s.active);

  return (
    <div className="space-y-8">
      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {inactiveSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-400 mb-4">
            Inactive Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No sessions yet. Create your first session to get started.
          </p>
        </div>
      )}
    </div>
  );
}
