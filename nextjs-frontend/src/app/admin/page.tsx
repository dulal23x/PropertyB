"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type AdminInquiry,
  type AdminListing,
  type AdminStats,
  fetchAdminInquiries,
  fetchAdminListings,
  fetchAdminStats,
  fetchRecentAuditLogs,
} from "@/lib/admin-api";

function StatCard({ label, value, tone = "emerald" }: { label: string; value: number; tone?: "emerald" | "amber" | "rose" | "sky" }) {
  const tones = {
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    sky: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  };
  return (
    <div className={`rounded-3xl border p-5 ${tones[tone]}`}>
      <p className="text-sm font-semibold text-slate-300">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats>({});
  const [pending, setPending] = useState<AdminListing[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, pendingData, inquiryData, logsData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminListings("status=pending_review&page_size=5"),
          fetchAdminInquiries("status=new&page_size=5"),
          fetchRecentAuditLogs(),
        ]);
        setStats(statsData);
        setPending(pendingData.items || []);
        setInquiries(inquiryData.items || []);
        setRecentLogs(logsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Approval first</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black text-white">Admin Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Review pending listings, manage user activity, handle inquiries, and verify email operations from one stable MVP console.
            </p>
          </div>
          <Link href="/admin/properties" className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300">
            Open Pending Queue
          </Link>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending Listings" value={stats.pending_review || 0} tone="amber" />
        <StatCard label="Published Listings" value={stats.approved || 0} />
        <StatCard label="New Inquiries" value={stats.new_inquiries || 0} tone="sky" />
        <StatCard label="Total Users" value={stats.total_users || 0} />
        <StatCard label="Rejected" value={stats.rejected || 0} tone="rose" />
        <StatCard label="Unpublished" value={stats.unpublished || 0} tone="amber" />
        <StatCard label="Archived" value={stats.archived || 0} />
        <StatCard label="Emails Today" value={stats.emails_sent_today || 0} tone="sky" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">Latest Pending</h3>
            <Link href="/admin/properties" className="text-sm font-bold text-emerald-700 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No pending listings.</p>
            ) : (
              pending.map((item) => (
                <Link key={item.id} href={`/admin/properties/${item.id}`} className="block rounded-2xl border border-slate-100 p-3 hover:border-emerald-300">
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {item.area_name || item.city}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">Latest Inquiries</h3>
            <Link href="/admin/inquiries" className="text-sm font-bold text-emerald-700 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No new inquiries.</p>
            ) : (
              inquiries.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-3">
                  <p className="text-sm font-black">{item.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.listing_title || `Listing #${item.listing_id}`}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black">24h Event Stream</h3>
          </div>
          <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No recent activity.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-50 bg-slate-50/50 p-3 text-xs">
                  <div className="flex justify-between">
                    <span className="font-black uppercase text-emerald-700">{log.action.replace('_', ' ')}</span>
                    <span className="text-slate-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="mt-1 font-bold text-slate-700 truncate">{log.listing_title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 italic">By: {log.actor_email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
