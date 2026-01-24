"use client";

import { useQuery } from "@tanstack/react-query";
import { EntriesResponse } from "@/pocketbase-types";
import { getSessionEntries } from "@/app/actions/admin-actions";
import EntryRow from "./entry-row";

interface EntriesListProps {
  sessionId: string;
  initialEntries: (EntriesResponse & {
    expand?: {
      player?: {
        id: string;
        username: string;
        session: string;
      };
    };
  })[];
}

export default function EntriesList({
  sessionId,
  initialEntries,
}: EntriesListProps) {
  const { data: entries = initialEntries } = useQuery({
    queryKey: ["sessionEntries", sessionId],
    queryFn: () => getSessionEntries(sessionId),
    initialData: initialEntries,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No entries in this session yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Units
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Hide
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Giveable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} sessionId={sessionId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
