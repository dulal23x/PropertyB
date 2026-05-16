"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  approveListing,
  archiveListing,
  fetchAdminListings,
  rejectListing,
  unpublishListing,
  type AdminListing,
} from "@/lib/admin-api";

type FilterState = {
  status: string;
  listing_purpose: string;
  property_type: string;
  city: string;
  area_name: string;
  owner_email: string;
  keyword: string;
};

const initialFilters: FilterState = {
  status: "pending_review",
  listing_purpose: "",
  property_type: "",
  city: "",
  area_name: "",
  owner_email: "",
  keyword: "",
};

function buildQuery(filters: FilterState) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString() || "status=pending_review";
}

export default function AdminPropertiesPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [query, setQuery] = useState("status=pending_review");
  const [items, setItems] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async (nextQuery = query) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminListings(nextQuery);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const runSearch = () => {
    setQuery(buildQuery(filters));
  };

  const quickAction = async (id: number, action: "approve" | "reject" | "unpublish" | "archive") => {
    setMessage("");
    try {
      if (action === "approve") {
        await approveListing(id);
        setMessage(`Listing ${id} approved.`);
      } else if (action === "reject") {
        const note = window.prompt("Rejection note is required");
        if (!note) return;
        await rejectListing(id, note);
        setMessage(`Listing ${id} rejected.`);
      } else if (action === "unpublish") {
        const note = window.prompt("Optional unpublish note");
        await unpublishListing(id, note || undefined);
        setMessage(`Listing ${id} unpublished.`);
      } else {
        await archiveListing(id);
        setMessage(`Listing ${id} archived.`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Listing queue</p>
          <h1 className="mt-2 text-2xl font-black">Admin Properties</h1>
          <p className="mt-1 text-sm text-slate-500">Review pending listings first, then manage the full lifecycle.</p>
        </div>
        <Link href="/admin" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to overview
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} placeholder="status" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.listing_purpose} onChange={(e) => setFilters((p) => ({ ...p, listing_purpose: e.target.value }))} placeholder="purpose" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.property_type} onChange={(e) => setFilters((p) => ({ ...p, property_type: e.target.value }))} placeholder="type" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))} placeholder="city" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.area_name} onChange={(e) => setFilters((p) => ({ ...p, area_name: e.target.value }))} placeholder="area" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.owner_email} onChange={(e) => setFilters((p) => ({ ...p, owner_email: e.target.value }))} placeholder="owner email" />
        <input className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))} placeholder="keyword" />
      </div>

      <div className="flex gap-3">
        <button onClick={runSearch} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">
          Apply filters
        </button>
        <button onClick={() => setFilters(initialFilters)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black">
          Reset
        </button>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading listings...</div>
      ) : items.length === 0 ? (
        <div className="py-10 text-sm text-slate-500">No listings match the current filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Images</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="rounded-2xl bg-slate-50">
                  <td className="px-3 py-3 font-bold">
                    <div>{item.title}</div>
                    <div className="text-xs font-normal text-slate-500">#{item.id}</div>
                  </td>
                  <td className="px-3 py-3">{item.owner_email || "-"}</td>
                  <td className="px-3 py-3">{item.area_name || item.city || "-"}</td>
                  <td className="px-3 py-3 capitalize">{item.listing_purpose} / {item.property_type}</td>
                  <td className="px-3 py-3">{item.price_amount ? `${item.currency || "BDT"} ${item.price_amount}` : "Call for price"}</td>
                  <td className="px-3 py-3">{item.image_count || 0}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-slate-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/properties/${item.id}`} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-700 shadow-sm">
                        Review
                      </Link>
                      <button onClick={() => quickAction(item.id, "approve")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">
                        Approve
                      </button>
                      <button onClick={() => quickAction(item.id, "reject")} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white">
                        Reject
                      </button>
                      <button onClick={() => quickAction(item.id, "unpublish")} className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white">
                        Unpublish
                      </button>
                      <button onClick={() => quickAction(item.id, "archive")} className="rounded-xl bg-slate-700 px-3 py-2 text-xs font-black text-white">
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
