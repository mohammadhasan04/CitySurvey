import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Next.js 16: middleware.ts is now proxy.ts, export function is 'proxy'
export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes — always accessible
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/statistics",
    "/ward-statistics",
    "/survey-progress",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isApiAuth = pathname.startsWith("/api/auth");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".");
  const isPublicApi = pathname === "/api/statistics" || pathname === "/api/statistics/ward";

  // Allow public paths, auth API, static assets, and public API endpoints
  if (isPublicPath || isApiAuth || isStaticAsset || isPublicApi) {
    return NextResponse.next();
  }

  // Require authentication for all other paths
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.role;

  // Role-based route protection
  if (pathname.startsWith("/resident")) {
    if (userRole !== "RESIDENT") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (userRole !== "CITY_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/super-admin")) {
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // API route protection
  if (pathname.startsWith("/api/")) {
    // CSRF Protection: Validate origin header on mutating requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !pathname.startsWith("/api/auth/")) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json({ error: "Forbidden: CSRF check failed" }, { status: 403 });
        }
      }
    }

    // Non-public API routes require authentication
    if (!isPublicApi && !isApiAuth && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
