import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Only apply to /admin routes
    if (!pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // Public admin auth pages (handle both with and without trailing slash)
    const normalizedPath = pathname.replace(/\/$/, "");
    const isAuthPage =
      normalizedPath === "/admin/login" ||
      normalizedPath === "/admin/forgot-password" ||
      normalizedPath === "/admin/reset-password";

    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValidSession = false;

    if (sessionCookie) {
      try {
        const result = await verifySessionToken(sessionCookie);
        isValidSession = result.valid;
      } catch {
        isValidSession = false;
      }
    }

    if (isAuthPage) {
      if (isValidSession) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Protected /admin pages: require valid session
    if (!isValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin" && pathname !== "/admin/") {
        loginUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Fail safe: redirect to login if anything unexpected occurs
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
