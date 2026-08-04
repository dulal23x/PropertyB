import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | PropertyBikri",
  description: "Learn how PropertyBikri may use cookies and similar technologies to operate and improve the website.",
};

export default function CookiesPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Cookies</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Cookie Policy</h1>
        <p className="mt-4 text-sm font-bold text-brand-textSecondary">Last updated: August 4, 2026</p>
        <div className="mt-10 rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-brand-textSecondary">
            PropertyBikri may use cookies and similar technologies to keep the site working, remember basic preferences, understand site usage, improve performance, and protect the platform from misuse.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary">
            You can control cookies through your browser settings. Some account, inquiry, or dashboard features may not work correctly if required cookies are disabled.
          </p>
        </div>
      </section>
    </div>
  );
}
