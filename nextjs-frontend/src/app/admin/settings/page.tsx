"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminStats, fetchEmailServerStats, fetchSiteSettings, updateSiteSetting, type AdminStats, type EmailServerStats, type SiteSetting } from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<AdminStats>({});
  const [emailStats, setEmailStats] = useState<EmailServerStats>({});
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [contactNumber, setContactNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const [s, e, setts] = await Promise.all([fetchAdminStats(), fetchEmailServerStats(), fetchSiteSettings()]);
      setStats(s);
      setEmailStats(e);
      setSettings(setts.items || []);
      const contact = setts.items?.find((x) => x.setting_key === "global_contact_number");
      if (contact) setContactNumber(contact.setting_value);
    };
    load();
  }, []);

  const handleSaveContact = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateSiteSetting("global_contact_number", contactNumber);
      setMessage("Global contact number updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

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

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="rounded-2xl border border-slate-200 p-5">
        <h2 className="text-lg font-black mb-2">Global Contact Information</h2>
        <p className="text-sm text-slate-500 mb-4">This is the default phone number revealed to public visitors when they click "Get a Callback" on any property listing.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g. +8801957325397"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 font-medium"
          />
          <button 
            onClick={handleSaveContact} 
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-6 py-2 font-black text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Number"}
          </button>
        </div>
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
    </div>
  );
}
