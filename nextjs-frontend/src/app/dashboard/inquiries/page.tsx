"use client";

import { useEffect, useState } from "react";
import { fetchMyInquiries } from "@/lib/property-api";
import Link from "next/link";
import { Mail, MessageSquareMore, PhoneCall } from "lucide-react";

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
             <MessageSquareMore className="h-8 w-8" />
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
                      <Mail className="h-3.5 w-3.5" />
                      {item.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="h-3.5 w-3.5" />
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
