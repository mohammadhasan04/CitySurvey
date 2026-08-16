"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);

  useEffect(() => {
    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setIsSupabaseLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setIsSupabaseLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isLoading = status === "loading" || isSupabaseLoading;

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
      }
    : supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0],
        role: supabaseUser.user_metadata?.role || "RESIDENT",
      }
    : null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await nextAuthSignOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role || null,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
