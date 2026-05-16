"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminInquiries, updateInquiryStatus, type AdminInquiry } from "@/lib/admin-api";

export default function AdminInquiriesPage() {
  const [status, setStatus] = useState("new");
  const [query, setQuery] = useState("status=new");
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (nextQuery = query) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminInquiries(nextQuery);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const applyFilter = () => setQuery(status ? `status=${encodeURIComponent(status)}` : "");

  const action = async (id: number, nextStatus: "contacted" | "closed" | "spam") => {
    try {
      await updateInquiryStatus(id, nextStatus);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Inquiry handling</p>
          <h1 className="mt-2 text-2xl font-black">Admin Inquiries</h1>
        </div>
        <Link href="/admin" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to overview
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="closed">closed</option>
          <option value="spam">spam</option>
        </select>
        <button onClick={applyFilter} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">
          Apply filter
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading inquiries...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-sm text-slate-500">No inquiries match this filter.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black">{item.name}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase">{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.phone} {item.email ? `| ${item.email}` : ""} {item.listing_title ? `| ${item.listing_title}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{item.message || "No message"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/properties/${item.listing_id}`} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700 shadow-sm">
                    Open listing
                  </Link>
                  <button onClick={() => action(item.id, "contacted")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">
                    Contacted
                  </button>
                  <button onClick={() => action(item.id, "closed")} className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-black text-white">
                    Closed
                  </button>
                  <button onClick={() => action(item.id, "spam")} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white">
                    Spam
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
