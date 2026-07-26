"use client";

import Link from "next/link";
import { useState } from "react";
import { sendAdminEmail } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default function AdminEmailComposePage() {
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await sendAdminEmail({ to_email: toEmail, subject, body, sender_type: "admin" });
      setMessage("Email logged and sent.");
      setToEmail("");
      setSubject("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Admin compose</p>
          <h1 className="mt-2 text-2xl font-black">Send Email</h1>
        </div>
        <Link href="/admin/email-hub" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to email hub
        </Link>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4">
        <input value={toEmail} onChange={(e) => setToEmail(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Recipient email" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Subject" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Email body" />
      </div>

      <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
        Send Email
      </button>
    </form>
  );
}
