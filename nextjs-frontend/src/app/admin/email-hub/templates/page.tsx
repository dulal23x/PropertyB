"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchEmailTemplates, updateEmailTemplate, type EmailTemplate } from "@/lib/admin-api";

export default function AdminEmailTemplatesPage() {
  const [items, setItems] = useState<EmailTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchEmailTemplates();
      setItems(data.items || []);
      if (!selectedId && data.items?.length) {
        const first = data.items[0];
        setSelectedId(first.id);
        setSubject(first.subject);
        setBody(first.body);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (template: EmailTemplate) => {
    setSelectedId(template.id);
    setSubject(template.subject);
    setBody(template.body);
  };

  const save = async () => {
    if (!selectedId) return;
    setMessage("");
    setError("");
    try {
      await updateEmailTemplate(selectedId, subject, body);
      setMessage("Template saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update template");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Template editor</p>
          <h1 className="mt-2 text-2xl font-black">Email Templates</h1>
        </div>
        <Link href="/admin/email-hub" className="text-sm font-bold text-emerald-700 hover:underline">
          Back to email hub
        </Link>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading templates...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            {items.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => choose(template)}
                className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
                  template.id === selectedId ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <div>{template.template_key}</div>
                <div className="text-xs font-normal text-slate-500">{template.subject}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4 lg:col-span-2">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Subject" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Template body" />
            <button onClick={save} type="button" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">
              Save template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
