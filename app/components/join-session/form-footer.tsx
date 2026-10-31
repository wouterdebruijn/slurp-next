import Link from "next/link";

export function FormFooter() {
  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-sm text-mist">
        Pick your séance, claim your cursed glass and sign your name&hellip; in
        blood! 🩸
      </p>
      <Link
        href="/admin"
        className="text-xs text-mist/70 hover:text-bone transition-colors"
      >
        Admin
      </Link>
    </div>
  );
}
