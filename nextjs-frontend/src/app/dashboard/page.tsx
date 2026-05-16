"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/use-auth-session";
import { fetchOwnerDashboardSummary } from "@/lib/property-api";
import { listingStatusLabel, nextActionLabel } from "@/utils/listing-status";

export default function DashboardOverview() {
  const { user } = useAuthSession();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOwnerDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-brand-dark">Welcome back, {user?.full_name}</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: summary.total },
          { label: "Pending", value: summary.pending_review, color: "text-amber-600" },
          { label: "Published", value: summary.approved, color: "text-green-600" },
          { label: "Rejected", value: summary.rejected, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color || "text-gray-900"}`}>{stat.value || 0}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Listings</h2>
        {summary.recent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No listings found.</p>
            <Link href="/dashboard/listings/new" className="text-brand-green font-bold hover:underline">Post your first property</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.recent.map((listing: any) => (
              <div key={listing.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-bold">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listingStatusLabel(listing.status)}</p>
                </div>
                <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-xs font-bold text-brand-green">
                  {nextActionLabel(listing.next_action)}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
