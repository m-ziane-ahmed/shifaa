"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AuthUser = { id: string; email: string; name: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata?.name as string) ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ? toAuthUser(u) : null);
  }, [supabase]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toAuthUser(session.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [refresh, supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      router.refresh();
      return toAuthUser(data.user);
    },
    [supabase, router]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Erreur lors de l'inscription");
      router.refresh();
      return toAuthUser(data.user);
    },
    [supabase, router]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push("/");
  }, [supabase, router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
