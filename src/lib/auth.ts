import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "./prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: {
            email: email.toLowerCase(),
            deletedAt: null,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Log the login
        await prisma.auditLog.create({
          data: {
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            details: JSON.stringify({ email: user.email }),
            userId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          householdId: user.householdId,
          image: user.image,
        };
      },
    }),
  ],
});

// Helper to get authenticated user or throw
export async function getAuthUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

// Helper to check if user has required role
export async function requireRole(allowedRoles: string[]) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

// Helper to create audit log
export async function createAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userId,
    },
  });
}
