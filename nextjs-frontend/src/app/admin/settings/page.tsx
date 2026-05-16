"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminStats, fetchEmailServerStats, type AdminStats, type EmailServerStats } from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<AdminStats>({});
  const [emailStats, setEmailStats] = useState<EmailServerStats>({});

  useEffect(() => {
    const load = async () => {
      const [s, e] = await Promise.all([fetchAdminStats(), fetchEmailServerStats()]);
      setStats(s);
      setEmailStats(e);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">System settings</p>
          <h1 className="mt-2 text-2xl font-black">Admin Settings</h1>
        </div>
        <Link href="/admin" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to overview
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs uppercase text-slate-500">Public phone required</div>
          <div className="mt-1 text-lg font-black">{stats.pending_review !== undefined ? "Configured in backend env" : "Check backend"}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs uppercase text-slate-500">Email provider</div>
          <div className="mt-1 text-lg font-black">{emailStats.provider || "-"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        This page is intentionally basic for MVP. The backend owns the business rules, approval workflow, privacy boundary, and email state.
      </div>
    </div>
  );
}
