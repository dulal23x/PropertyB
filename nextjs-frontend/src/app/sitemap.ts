import type { MetadataRoute } from "next";
import { fetchProperties } from "@/lib/property-api";
import { SEO_LANDING_PAGES, landingQueryString } from "@/lib/seo-pages";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://propertybikri.com";
const FALLBACK_LASTMOD = new Date(process.env.NEXT_PUBLIC_DEPLOY_LASTMOD || "2026-08-04T00:00:00.000Z");
type SitemapEntry = MetadataRoute.Sitemap[number];

function isSitemapEntry(entry: SitemapEntry | null): entry is SitemapEntry {
  return entry !== null;
}

function listingLastModified(property: { updated_at?: string | null; created_at?: string | null }) {
  const value = property.updated_at || property.created_at;
  if (!value) return FALLBACK_LASTMOD;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? FALLBACK_LASTMOD : date;
}

async function fetchAllSaleListingSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const firstPage = await fetchProperties("listing_purpose=sale&page_size=50&page=1").catch(() => ({ items: [], total: 0 }));
  const entries: MetadataRoute.Sitemap = firstPage.items.map((property) => ({
    url: `${BASE_URL}/properties/${property.slug}`,
    lastModified: listingLastModified(property),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const total = Number(firstPage.total || entries.length);
  const totalPages = Math.ceil(total / 50);

  for (let page = 2; page <= totalPages; page += 1) {
    const data = await fetchProperties(`listing_purpose=sale&page_size=50&page=${page}`).catch(() => ({ items: [] }));
    entries.push(
      ...data.items.map((property) => ({
        url: `${BASE_URL}/properties/${property.slug}`,
        lastModified: listingLastModified(property),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: FALLBACK_LASTMOD, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/properties`, lastModified: FALLBACK_LASTMOD, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/post-property`, lastModified: FALLBACK_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/advertise`, lastModified: FALLBACK_LASTMOD, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: FALLBACK_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: FALLBACK_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/careers`, lastModified: FALLBACK_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: FALLBACK_LASTMOD, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: FALLBACK_LASTMOD, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: FALLBACK_LASTMOD, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/sitemap`, lastModified: FALLBACK_LASTMOD, changeFrequency: "monthly", priority: 0.2 },
  ];

  const seoPages: Array<SitemapEntry | null> = await Promise.all(
    SEO_LANDING_PAGES.map(async (page) => {
      const data = await fetchProperties(landingQueryString(page, { page_size: "1" })).catch(() => ({ total: 0 }));
      const indexable = Number(data.total || 0) > 0 || page.slug.includes("dhaka");
      if (!indexable) return null;
      return {
        url: `${BASE_URL}/${page.slug}`,
        lastModified: FALLBACK_LASTMOD,
        changeFrequency: "weekly" as const,
        priority: page.slug.includes("dhaka") ? 0.8 : 0.6,
      };
    })
  );

  const propertyPages = await fetchAllSaleListingSitemapEntries();

  const indexableSeoPages: MetadataRoute.Sitemap = seoPages.filter(isSitemapEntry);

  return [
    ...staticPages,
    ...indexableSeoPages,
    ...propertyPages,
  ];
}
