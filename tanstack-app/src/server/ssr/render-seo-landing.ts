/**
 * Server-Side Rendered Programmatic SEO Landing Page Engine
 * Handles all 90 programmatic SEO landing pages with D1 pre-queries and rich FAQs.
 */

import { renderHtmlDocument, escapeHtml } from "./html-template";
import { renderPropertyCardHtml } from "./render-home";
import { SEO_LANDING_PAGES, type SeoLandingPage } from "../../lib/seo-pages";
import { ListingsRepository, type PublicSearchFilters } from "../db/repositories/listings.repo";
import type { ListingPurpose, PropertyType } from "../types/models";
import type { AppEnv } from "../types/env";

export async function renderSeoLandingPage(slug: string, env: AppEnv): Promise<Response | null> {
  const pageDef = SEO_LANDING_PAGES.find((p) => p.slug === slug);
  if (!pageDef) {
    return null;
  }

  const listingsRepo = new ListingsRepository(env.DB);
  const q = pageDef.query;

  const filters: PublicSearchFilters = {
    listing_purpose: (q.listing_purpose || q.purpose || "sale") as ListingPurpose,
    property_type: q.property_type as PropertyType | undefined,
    city: q.city || undefined,
    area_name: q.area_name || q.location || pageDef.area || undefined,
    min_price: q.min_price ? Number(q.min_price) : undefined,
    max_price: q.max_price ? Number(q.max_price) : undefined,
    bedrooms: q.bedrooms ? Number(q.bedrooms) : undefined,
    page_size: 9,
    sort: "newest",
  };

  const result = await listingsRepo.searchPublic(filters);

  // JSON-LD FAQ Schema
  const faqSchema = pageDef.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pageDef.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : undefined;

  const content = `
  <div class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Breadcrumb Navigation -->
      <nav class="flex text-xs font-semibold text-gray-500 mb-6">
        <a href="/" class="hover:text-brand-green">Home</a>
        <span class="mx-2">&rsaquo;</span>
        <span class="text-brand-dark line-clamp-1">${escapeHtml(pageDef.h1)}</span>
      </nav>

      <!-- SEO Page Hero Header -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 shadow-sm mb-10">
        <h1 class="text-2xl md:text-4xl font-black text-brand-dark tracking-tight leading-tight mb-4">
          ${escapeHtml(pageDef.h1)}
        </h1>
        <p class="text-sm md:text-base text-gray-700 leading-relaxed max-w-4xl mb-6">
          ${escapeHtml(pageDef.intro)}
        </p>

        <!-- Quick Query Tags -->
        <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
          <span class="text-xs font-black uppercase tracking-wider text-gray-500 mr-2">Quick Search:</span>
          ${pageDef.area ? `<a href="/properties?area_name=${encodeURIComponent(pageDef.area)}&purpose=sale" class="rounded-lg bg-gray-100 hover:bg-brand-green hover:text-white px-3 py-1.5 text-xs font-bold text-gray-800 transition-colors">All in ${escapeHtml(pageDef.area)}</a>` : ""}
          <a href="/properties?listing_purpose=sale" class="rounded-lg bg-gray-100 hover:bg-brand-green hover:text-white px-3 py-1.5 text-xs font-bold text-gray-800 transition-colors">All For Sale</a>
          <a href="/properties?listing_purpose=rent" class="rounded-lg bg-gray-100 hover:bg-brand-green hover:text-white px-3 py-1.5 text-xs font-bold text-gray-800 transition-colors">All For Rent</a>
        </div>
      </div>

      <!-- Properties Results Section -->
      <div class="mb-14">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight text-brand-dark">
              Available Listings (${result.total})
            </h2>
            <p class="text-xs text-gray-500 mt-1">Verified options matching your location and criteria</p>
          </div>
          <a href="/properties?${new URLSearchParams(pageDef.query).toString()}" class="text-xs font-black uppercase tracking-wider text-brand-green hover:underline">
            View with full filters &rarr;
          </a>
        </div>

        ${
          result.items.length === 0
            ? `
          <div class="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
            <h3 class="text-base font-bold text-gray-900">No immediate listings matching this exact query</h3>
            <p class="mt-1 text-xs text-gray-500 mb-4">Contact our team to get notified when new properties in this area are posted.</p>
            <a href="/properties" class="inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md text-white bg-brand-green hover:bg-brand-greenHover">
              Explore All Dhaka Properties
            </a>
          </div>`
            : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${result.items.map((p) => renderPropertyCardHtml(p)).join("")}
          </div>`
        }
      </div>

      <!-- Content Sections (if any) -->
      ${
        pageDef.contentSections && pageDef.contentSections.length > 0
          ? `
      <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-10 space-y-6">
        ${pageDef.contentSections
          .map(
            (sec) => `
          <div>
            <h3 class="text-lg font-black uppercase tracking-wider text-brand-dark mb-2">${escapeHtml(sec.heading)}</h3>
            <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(sec.body)}</p>
          </div>`
          )
          .join("")}
      </div>`
          : ""
      }

      <!-- FAQs Accordion Section -->
      ${
        pageDef.faqs.length > 0
          ? `
      <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-10">
        <h2 class="text-xl font-black uppercase tracking-tight text-brand-dark mb-6 pb-3 border-b border-gray-100">
          Frequently Asked Questions
        </h2>
        <div class="space-y-4">
          ${pageDef.faqs
            .map(
              (faq) => `
            <div class="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
              <h3 class="font-bold text-sm text-brand-dark mb-2">${escapeHtml(faq.question)}</h3>
              <p class="text-xs text-gray-700 leading-relaxed">${escapeHtml(faq.answer)}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>`
          : ""
      }

      <!-- Related Area Landing Pages -->
      ${
        pageDef.related && pageDef.related.length > 0
          ? `
      <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
        <h2 class="text-lg font-black uppercase tracking-tight text-brand-dark mb-4 pb-2 border-b border-gray-100">
          Related Property Searches
        </h2>
        <div class="flex flex-wrap gap-2">
          ${pageDef.related
            .map(
              (relSlug) => `
            <a href="/${relSlug}" class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-800 hover:border-brand-green hover:text-brand-green transition-colors">
              ${relSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </a>`
            )
            .join("")}
        </div>
      </div>`
          : ""
      }

    </div>
  </div>`;

  const html = renderHtmlDocument({
    meta: {
      title: pageDef.title,
      description: pageDef.description,
      canonical: `/${pageDef.slug}`,
      jsonLd: faqSchema,
    },
    content,
  });

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
