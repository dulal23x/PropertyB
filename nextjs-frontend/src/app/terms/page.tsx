import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | PropertyBikri",
  description: "Review PropertyBikri terms for property listings, inquiries, advertising, account use, and marketplace conduct.",
};

const sections = [
  ["Use of the service", "PropertyBikri helps users browse, post, promote, and inquire about properties. Users are responsible for providing accurate information and using the platform lawfully."],
  ["Listings", "Property details, prices, availability, ownership, and images must be accurate. PropertyBikri may review, edit, reject, or remove listings that appear misleading or unsuitable."],
  ["Inquiries and contact", "Users who submit inquiries agree that their contact details may be shared with the relevant listing contact or PropertyBikri support team."],
  ["Advertising", "Promotion services depend on submitted property materials, campaign scope, and platform availability. Specific campaign terms may be agreed separately."],
  ["Limitations", "PropertyBikri is a marketplace and information platform. Users should independently verify legal, financial, and property details before making decisions."],
];

export default function TermsPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Terms</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Terms and Conditions</h1>
        <p className="mt-4 text-sm font-bold text-brand-textSecondary">Last updated: August 4, 2026</p>
        <div className="mt-10 space-y-5">
          {sections.map(([title, text]) => (
            <section key={title} className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary">{text}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
