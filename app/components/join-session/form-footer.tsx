import Link from "next/link";

export function FormFooter() {
  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-sm text-gray-500">
        Select your session, enter your glass ID and name to join!
      </p>
      <Link
        href="/admin"
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Admin
      </Link>
    </div>
  );
}
