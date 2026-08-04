import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap | PropertyBikri",
  description: "Browse key PropertyBikri pages for property search, listing, advertising, company information, and policies.",
};

const links = [
  ["/", "Home"],
  ["/properties", "Properties"],
  ["/post-property", "Post Property"],
  ["/advertise", "Advertise"],
  ["/about", "About Us"],
  ["/contact", "Contact Us"],
  ["/careers", "Careers"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms and Conditions"],
  ["/cookies", "Cookie Policy"],
  ["/sitemap.xml", "XML Sitemap"],
];

export default function SitemapPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Sitemap</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">PropertyBikri sitemap</h1>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-xl border border-brand-border bg-white px-5 py-4 text-sm font-black uppercase tracking-wider shadow-sm hover:border-brand-green">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
