import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, Search } from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { fetchProperties } from "@/lib/property-api";
import { getSeoLandingPage, landingPageHref, landingQueryString, SEO_LANDING_PAGES } from "@/lib/seo-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://propertybikri.com";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SEO_LANDING_PAGES.map((page) => ({ seoSlug: page.slug }));
}

export async function generateMetadata({ params }: { params: { seoSlug: string } }): Promise<Metadata> {
  const page = getSeoLandingPage(params.seoSlug);
  if (!page) return {};

  const data = await fetchProperties(landingQueryString(page, { page_size: "1" })).catch(() => ({ total: 0 }));
  const indexable = Number(data.total || 0) > 0 || page.slug.includes("dhaka");

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}/${page.slug}`,
      siteName: "PropertyBikri",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

function getRelatedPages(slugs: string[]) {
  return slugs
    .map((slug) => SEO_LANDING_PAGES.find((page) => page.slug === slug))
    .filter(Boolean)
    .slice(0, 6) as typeof SEO_LANDING_PAGES;
}

export default async function SeoLandingPage({ params }: { params: { seoSlug: string } }) {
  const page = getSeoLandingPage(params.seoSlug);
  if (!page) notFound();

  const data = await fetchProperties(landingQueryString(page, { page_size: "12" })).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    page_size: 0,
  }));
  const related = getRelatedPages(page.related);
  const listingUrl = `/properties?${landingQueryString(page)}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE_URL}/${page.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: page.h1,
      url: `${SITE_URL}/${page.slug}`,
      numberOfItems: data.items.length,
      itemListElement: data.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/properties/${item.slug}`,
        name: item.title,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <div className="bg-brand-light text-brand-dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-brand-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <nav className="mb-5 flex items-center gap-2 text-sm font-bold text-brand-textSecondary">
            <Link href="/" className="hover:text-brand-green">Home</Link>
            <span>/</span>
            <Link href="/properties?purpose=sale" className="hover:text-brand-green">Properties</Link>
            <span>/</span>
            <span className="text-brand-dark">{page.h1}</span>
          </nav>
          <div className="max-w-4xl">
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">
              Verified Dhaka property listings
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{page.h1}</h1>
            <p className="mt-5 text-base leading-relaxed text-brand-textSecondary md:text-lg">{page.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={listingUrl} className="inline-flex items-center gap-2 rounded bg-brand-green px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-greenHover">
                Browse matching listings
                <ArrowRight size={16} />
              </Link>
              <Link href="/post-property" className="inline-flex items-center gap-2 rounded border border-brand-border bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-brand-dark hover:border-brand-green">
                Post property
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            ["Search focus", page.primaryKeyword],
            ["Location", page.area || "Dhaka"],
            ["Listings found", `${data.total || 0} active matches`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-textSecondary">{label}</p>
              <p className="mt-2 text-xl font-black capitalize">{value}</p>
            </div>
          ))}
        </div>

        {data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-brand-border bg-white px-8 py-16 text-center shadow-sm">
            <Search className="mx-auto text-gray-300" size={48} />
            <h2 className="mt-6 text-2xl font-black">No active matches right now</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-textSecondary">
              This search page is prepared for buyers, but matching inventory may change. Browse all Dhaka listings or contact PropertyBikri for current availability.
            </p>
            <Link href="/properties?purpose=sale" className="mt-7 inline-flex rounded bg-brand-green px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-greenHover">
              Browse all sale listings
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-brand-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Buyer guide</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">How to shortlist the right property</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-textSecondary">
              Compare the asking price with nearby listings, inspect location access, confirm building or land documents, and verify the seller or agent before making a decision. For houses, lands and apartments for sale in Dhaka, the best shortlist usually balances location, documents, usable size, daily access and resale demand.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {["Verify ownership and approvals", "Compare price, size and condition", "Check roads, utilities and parking", "Visit before final negotiation"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-light p-4">
                <BadgeCheck size={20} className="shrink-0 text-brand-green" />
                <span className="text-sm font-black">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {page.contentSections && page.contentSections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Local buying notes</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">What to know before you compare listings</h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {page.contentSections.map((section) => (
              <section key={section.heading} className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black leading-snug">{section.heading}</h3>
                <p className="mt-4 text-sm leading-7 text-brand-textSecondary">{section.body}</p>
              </section>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-black">Common questions</h2>
            <div className="mt-5 space-y-4">
              {page.faqs.map((item) => (
                <section key={item.question} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-black">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary">{item.answer}</p>
                </section>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black">Related searches</h2>
            <div className="mt-5 grid gap-3">
              {related.map((item) => (
                <Link key={item.slug} href={landingPageHref(item.slug)} className="flex items-center justify-between rounded-xl border border-brand-border bg-white px-5 py-4 text-sm font-black shadow-sm hover:border-brand-green">
                  <span>{item.h1}</span>
                  <MapPin size={16} className="text-brand-green" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
