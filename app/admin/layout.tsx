import { adminLogout } from "@/app/actions/admin-actions";
import { redirect } from "next/navigation";
import Link from "next/link";

async function LogoutButton() {
  "use server";

  async function handleLogout() {
    "use server";
    await adminLogout();
    redirect("/admin/login");
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="text-gray-400 hover:text-white transition-colors"
      >
        Logout
      </button>
    </form>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware handles authentication, no need to check here

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/admin"
                className="text-white font-bold text-xl hover:text-blue-400 transition-colors"
              >
                Admin Dashboard
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sessions
                </Link>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Site
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
