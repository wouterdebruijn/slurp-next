import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("pb_admin_auth")?.value;

  // If accessing login page and already authenticated, redirect to admin dashboard
  if (path === "/admin/login") {
    if (token) {
      try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
        pb.authStore.save(token, null);

        if (pb.authStore.isValid) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {
        // Token is invalid, allow access to login page
      }
    }
    return NextResponse.next();
  }

  // Check for admin authentication on all other /admin routes
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
      pb.authStore.save(token, null);

      if (!pb.authStore.isValid) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
