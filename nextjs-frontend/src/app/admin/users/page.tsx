"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminUsers, updateAdminUser, type AdminUser } from "@/lib/admin-api";

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminUsers();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (user: AdminUser) => {
    setMessage("");
    setError("");
    try {
      await updateAdminUser(user.id, {
        full_name: user.full_name ?? "",
        role: user.role,
        is_active: user.is_active,
      });
      setMessage(`Updated ${user.email}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Access control</p>
          <h1 className="mt-2 text-2xl font-black">Admin Users</h1>
        </div>
        <Link href="/admin" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to overview
        </Link>
      </div>

      <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
        Keep role edits deliberate. This is an MVP control panel, so use it only for operational account management.
      </p>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Full name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user, index) => (
                <tr key={user.id} className="rounded-2xl bg-slate-50">
                  <td className="px-3 py-3 font-semibold">{user.email}</td>
                  <td className="px-3 py-3">
                    <input
                      value={user.full_name || ""}
                      onChange={(e) => setItems((prev) => prev.map((row) => (row.id === user.id ? { ...row, full_name: e.target.value } : row)))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => setItems((prev) => prev.map((row) => (row.id === user.id ? { ...row, role: e.target.value } : row)))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="client">client</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      onChange={(e) => setItems((prev) => prev.map((row) => (row.id === user.id ? { ...row, is_active: e.target.checked } : row)))}
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-600">{user.created_at ? user.created_at.slice(0, 10) : "-"}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => save(items[index])} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">
                      Save
                    </button>
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
