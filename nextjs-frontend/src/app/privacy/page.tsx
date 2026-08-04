import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PropertyBikri",
  description: "Read how PropertyBikri handles personal information for property search, listings, inquiries, and account services.",
};

const sections = [
  ["Information we collect", "We may collect contact details, account information, listing content, inquiry details, device information, and basic usage data needed to operate the marketplace."],
  ["How we use information", "We use information to publish and manage listings, connect buyers and renters with property contacts, improve site performance, prevent abuse, and respond to support requests."],
  ["Sharing", "Listing and inquiry information may be shared with the relevant property owner, agent, or service provider when needed to complete a requested action."],
  ["Choices", "You may contact us to update account details, request listing changes, or ask questions about information connected to your use of PropertyBikri."],
];

export default function PrivacyPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Privacy</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Privacy Policy</h1>
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
