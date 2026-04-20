"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again or go back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-linear-to-r from-yellow-400 to-yellow-500 text-white font-bold rounded-2xl hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transition-all cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white border-2 border-yellow-400 text-yellow-600 font-bold rounded-2xl hover:bg-yellow-50 active:scale-95 transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
