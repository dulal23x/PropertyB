import { apiFetch } from "@/lib/api";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  full_name?: string | null;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user?: AuthUser | null;
};

const AUTH_USER_KEY = "realestate_auth_user";
const AUTH_COOKIE_KEY = "realestate_auth";

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session));
  window.document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; samesite=lax`;
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return getAuthSession()?.access_token || null;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function updateProfile(payload: { full_name: string }) {
  const res = await apiFetch("/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update profile");
  }
  return res.json() as Promise<AuthUser>;
}
