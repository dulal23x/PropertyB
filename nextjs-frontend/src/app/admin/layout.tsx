"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import { clearAuthSession, getAuthSession, type AuthUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/properties", label: "Listings" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/email-hub", label: "Email Hub" },
  { href: "/admin/email-hub/templates", label: "Templates" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.access_token) {
      window.location.href = "/auth/login";
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await apiFetch("/auth/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Auth check failed");
        const currentUser = (await res.json()) as AuthUser;
        if (currentUser.role !== "admin") {
          window.location.href = "/dashboard";
          return;
        }
        setUser(currentUser);
      } catch {
        clearAuthSession();
        window.location.href = "/auth/login";
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, []);

  if (checking) {
    return <div className="min-h-screen bg-slate-950 p-8 text-sm text-slate-200">Checking admin access...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="sticky top-6 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="mb-6 border-b border-white/10 pb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Admin Console</p>
              <h1 className="mt-2 text-xl font-black text-white">Real Estate Ops</h1>
              <p className="mt-2 truncate text-sm text-slate-300">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active ? "bg-emerald-400 text-slate-950" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/auth/login"
                onClick={() => clearAuthSession()}
                className="mt-4 block rounded-2xl px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/10"
              >
                Logout
              </Link>
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
