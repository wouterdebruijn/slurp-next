import { Suspense } from "react";

import ProfileClient from "@/app/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-zinc-50 px-4 py-8 dark:bg-black">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
            Loading…
          </div>
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
