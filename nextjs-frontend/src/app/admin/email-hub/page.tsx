"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchEmailLogs, fetchEmailServerStats, type EmailLog, type EmailServerStats } from "@/lib/admin-api";

export default function AdminEmailHubPage() {
  const [stats, setStats] = useState<EmailServerStats>({});
  const [items, setItems] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsData, logsData] = await Promise.all([fetchEmailServerStats(), fetchEmailLogs()]);
        setStats(statsData);
        setItems(logsData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load email hub");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Email operations</p>
          <h1 className="mt-2 text-2xl font-black">Admin Email Hub</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/email-hub/compose" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">
            Compose
          </Link>
          <Link href="/admin/email-hub/templates" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black">
            Templates
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs uppercase text-slate-500">Provider</div>
          <div className="mt-1 text-lg font-black">{stats.provider || "-"}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs uppercase text-slate-500">Emails sent today</div>
          <div className="mt-1 text-lg font-black">{stats.emails_sent_today ?? 0}</div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading email logs...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-sm text-slate-500">No email logs yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-black">{item.subject}</div>
                  <div className="text-sm text-slate-600">
                    {item.to_email} | {item.sender_type} | {item.status}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{item.created_at ? item.created_at.slice(0, 19).replace("T", " ") : "-"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
