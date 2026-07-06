"use client";

import { useEffect, useState } from "react";
import { fetchMyInquiries } from "@/lib/property-api";
import Link from "next/link";

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyInquiries();
        setInquiries(data.items || []);
      } catch (err) {
        console.error("Failed to load inquiries", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading inquiries...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-dark">Property Inquiries</h1>
        <p className="text-gray-500 text-sm">Leads and inquiries for your published listings.</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <p className="text-gray-500 font-medium">No inquiries received yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-green transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase rounded">
                      {item.status}
                    </span>
                    <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 italic">"{item.message}"</p>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      {item.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.73 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {item.phone}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end gap-4 shrink-0">
                  <Link 
                    href={`/properties/${item.listing_slug}`}
                    className="text-[10px] font-black uppercase text-brand-green hover:underline"
                  >
                    View Property: {item.listing_title}
                  </Link>
                  <div className="flex gap-2">
                    <a href={`mailto:${item.email}`} className="px-4 py-2 bg-brand-dark text-white text-xs font-black uppercase tracking-widest rounded hover:bg-gray-800 transition-colors">
                      Reply by Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
