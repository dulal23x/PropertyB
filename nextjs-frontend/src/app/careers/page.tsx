import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers | PropertyBikri",
  description: "Explore career opportunities and future hiring updates from PropertyBikri in Bangladesh.",
};

export default function CareersPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Careers</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Build the property marketplace with us.</h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-brand-textSecondary md:text-lg">
          PropertyBikri is growing its real estate, operations, support, marketing, and technology capabilities in Bangladesh.
        </p>
        <div className="mt-10 rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black">Current openings</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary">
            We are not listing public openings right now. For relevant opportunities, send your profile and area of interest to our team.
          </p>
          <Link href="mailto:info@propertybikri.com" className="mt-6 inline-flex rounded bg-brand-green px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-greenHover">
            Email Profile
          </Link>
        </div>
      </section>
    </div>
  );
}
