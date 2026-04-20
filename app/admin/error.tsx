"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-6">
          An error occurred in the admin panel. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-600 hover:text-white active:scale-95 transition-all"
          >
            Back to admin
          </Link>
        </div>
      </div>
    </div>
  );
}
