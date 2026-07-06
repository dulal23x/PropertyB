"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  approveListing,
  archiveListing,
  fetchAdminListing,
  rejectListing,
  unpublishListing,
  type AdminListingDetail,
} from "@/lib/admin-api";

export default function AdminPropertyReviewPage() {
  const params = useParams();
  const rawId = params.id;
  const listingId = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const [data, setData] = useState<AdminListingDetail | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminListing(listingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(listingId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const act = async (kind: "approve" | "reject" | "unpublish" | "archive") => {
    setError("");
    setMessage("");
    try {
      if (kind === "approve") {
        await approveListing(listingId);
        setMessage("Listing approved.");
      } else if (kind === "reject") {
        if (!note.trim()) {
          setError("Rejection note is required.");
          return;
        }
        await rejectListing(listingId, note.trim());
        setMessage("Listing rejected.");
      } else if (kind === "unpublish") {
        await unpublishListing(listingId, note.trim() || undefined);
        setMessage("Listing unpublished.");
      } else {
        await archiveListing(listingId);
        setMessage("Listing archived.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-white p-5 text-sm text-slate-500">Loading review page...</div>;
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white p-5">
        <p className="text-sm text-slate-500">Listing not found.</p>
        <Link href="/admin/properties" className="mt-4 inline-block text-sm font-bold text-emerald-700">
          Back to queue
        </Link>
      </div>
    );
  }

  const listing = data.listing;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Listing review</p>
          <h1 className="mt-2 text-2xl font-black">{listing.title}</h1>
          <p className="text-sm text-slate-500">
            #{listing.id} | {listing.status}
          </p>
        </div>
        <Link href="/admin/properties" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to queue
        </Link>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4 lg:col-span-2">
          <h2 className="text-lg font-black">Listing facts</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div><span className="text-xs uppercase text-slate-500">Owner</span><div className="font-semibold">{data.owner?.email || "-"}</div></div>
            <div><span className="text-xs uppercase text-slate-500">Location</span><div className="font-semibold">{listing.display_address || listing.area_name || listing.city || "-"}</div></div>
            <div><span className="text-xs uppercase text-slate-500">Purpose</span><div className="font-semibold capitalize">{listing.listing_purpose}</div></div>
            <div><span className="text-xs uppercase text-slate-500">Type</span><div className="font-semibold capitalize">{listing.property_type}</div></div>
            <div><span className="text-xs uppercase text-slate-500">Price</span><div className="font-semibold">{listing.price_amount ? `${listing.currency || "BDT"} ${listing.price_amount}` : "Call for price"}</div></div>
            <div><span className="text-xs uppercase text-slate-500">Images</span><div className="font-semibold">{listing.image_count || 0}</div></div>
          </div>
          <div className="mt-4">
            <span className="text-xs uppercase text-slate-500">Description</span>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{listing.description || "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-black">Admin actions</h2>
          <label className="mt-4 block text-xs font-black uppercase text-slate-500">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Rejection or unpublish note"
          />
          <div className="mt-4 grid gap-2">
            <button onClick={() => act("approve")} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">Approve</button>
            <button onClick={() => act("reject")} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white">Reject</button>
            <button onClick={() => act("unpublish")} className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white">Unpublish</button>
            <button onClick={() => act("archive")} className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-black text-white">Archive</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-black">Owner info</h2>
          <p className="mt-2 text-sm text-slate-600">{data.owner?.full_name || "No full name"}</p>
          <p className="text-sm text-slate-600">{data.owner?.email || "No owner data"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-black">Images</h2>
          <div className="mt-3 space-y-2">
            {data.images.length === 0 ? (
              <p className="text-sm text-slate-500">No images attached.</p>
            ) : (
              data.images.map((image) => (
                <div key={image.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">{image.public_url}</div>
                  <div className="text-xs text-slate-500">{image.is_cover ? "Cover image" : "Gallery image"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-4">
        <h2 className="text-lg font-black">Audit trail</h2>
        <div className="mt-3 space-y-2">
          {data.audit_logs.length === 0 ? (
            <p className="text-sm text-slate-500">No audit logs yet.</p>
          ) : (
            data.audit_logs.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-semibold">{entry.action}</div>
                <div className="text-xs text-slate-500">
                  {entry.from_status || "-"}{" -> "}{entry.to_status || "-"} {entry.note ? `| ${entry.note}` : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
