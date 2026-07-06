"use client";

import { useAuthSession } from "@/lib/use-auth-session";
import { useState, useEffect } from "react";
import { updateProfile } from "@/lib/auth";

export default function ProfilePage() {
  const { user, refresh } = useAuthSession();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile({ full_name: fullName });
      await refresh();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-dark">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and contact details.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        {message && (
          <div className="p-3 bg-green-50 text-green-700 text-sm font-bold rounded-md border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-brand-green outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-gray-500 mb-1">Email Address</label>
            <input 
              type="email" 
              value={user?.email || ""} 
              disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-md px-4 py-2 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-gray-400 italic">Email cannot be changed for security reasons.</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-brand-green text-white font-black uppercase tracking-widest px-8 py-3 rounded shadow-lg hover:bg-brand-greenHover disabled:opacity-60 transition-all"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
