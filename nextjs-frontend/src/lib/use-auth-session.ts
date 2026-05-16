"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth";

type AuthState = {
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  dashboardHref: string;
  refresh: () => Promise<AuthSession | null>;
  logout: () => void;
};

export function useAuthSession(): AuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  const refresh = useCallback(async () => {
    const current = getAuthSession();
    if (!current?.access_token) {
      setSession(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${current.access_token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("auth_check_failed");
      const user = (await res.json()) as AuthUser;
      const next = { ...current, user };
      setAuthSession(next);
      setSession(next);
      setLoading(false);
      return next;
    } catch {
      clearAuthSession();
      setSession(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const user = session?.user || null;
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      loading,
      session,
      user,
      isAuthenticated: Boolean(session?.access_token),
      isAdmin,
      dashboardHref: isAdmin ? "/admin" : "/dashboard",
      refresh,
      logout: () => {
        clearAuthSession();
        setSession(null);
      },
    }),
    [loading, session, user, isAdmin, refresh],
  );
}
