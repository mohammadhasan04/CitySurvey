import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth configuration (no database adapter here)
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/resident") ||
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/super-admin");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      if (isOnAuth && isLoggedIn) {
        // Redirect logged-in users away from auth pages
        const role = auth?.user?.role;
        if (role === "SUPER_ADMIN") return Response.redirect(new URL("/super-admin", nextUrl));
        if (role === "CITY_ADMIN") return Response.redirect(new URL("/admin", nextUrl));
        if (role === "RESIDENT") return Response.redirect(new URL("/resident", nextUrl));
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.householdId = user.householdId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "CITY_ADMIN" | "RESIDENT" | "PUBLIC";
        session.user.householdId = (token.householdId as string | null) ?? null;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
