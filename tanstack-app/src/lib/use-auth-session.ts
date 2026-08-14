import { useState, useEffect } from "react";
import { getAuthToken, setAuthToken, apiFetch } from "./api-client";

export interface AuthUser {
  id: number;
  email: string;
  role: "client" | "admin";
  full_name?: string | null;
}

export function useAuthSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<AuthUser>("/auth/me")
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  return {
    loading,
    user,
    isAuthenticated,
    isAdmin,
    dashboardHref,
    logout,
  };
}
