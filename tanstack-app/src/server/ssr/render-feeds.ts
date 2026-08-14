/**
 * Server-Side Rendered Feeds: Sitemap XML and Robots.txt
 */

import { SEO_LANDING_PAGES } from "../../lib/seo-pages";
import { ListingsRepository } from "../db/repositories/listings.repo";
import type { AppEnv } from "../types/env";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

export async function renderSitemapXml(env: AppEnv): Promise<Response> {
  const baseUrl = "https://propertybikri.com";
  const now = new Date().toISOString();

  // 1. Static Routes
  const staticRoutes: SitemapEntry[] = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/properties`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/properties?purpose=sale`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/properties?purpose=rent`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/about`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/contact`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/careers`, priority: "0.5", changefreq: "monthly" },
    { loc: `${baseUrl}/advertise`, priority: "0.6", changefreq: "monthly" },
    { loc: `${baseUrl}/post-property`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/terms`, priority: "0.3", changefreq: "yearly" },
    { loc: `${baseUrl}/privacy`, priority: "0.3", changefreq: "yearly" },
    { loc: `${baseUrl}/cookies`, priority: "0.3", changefreq: "yearly" },
  ];

  // 2. SEO Landing Pages (90 pages)
  const seoRoutes: SitemapEntry[] = SEO_LANDING_PAGES.map((page) => ({
    loc: `${baseUrl}/${page.slug}`,
    priority: "0.8",
    changefreq: "weekly",
  }));

  // 3. Published Property Listings from D1
  const listingsRepo = new ListingsRepository(env.DB);
  const result = await listingsRepo.searchPublic({ page_size: 500 });
  const listingRoutes: SitemapEntry[] = result.items.map((item) => ({
    loc: `${baseUrl}/properties/${item.slug}`,
    lastmod: item.updated_at || now,
    priority: "0.8",
    changefreq: "weekly",
  }));

  const allEntries: SitemapEntry[] = [...staticRoutes, ...seoRoutes, ...listingRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod || now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export function renderRobotsTxt(): Response {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /api/admin/
Disallow: /api/properties/me/
Disallow: /auth/

Sitemap: https://propertybikri.com/sitemap.xml
`;

  return new Response(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
