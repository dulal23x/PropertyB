# PropertyBikri SEO Title and Metadata Plan

## 1. Primary SEO Goal

PropertyBikri's broad sale-market phrase is **Houses, Lands & Apartments For Sale in Dhaka**. The phrase should appear in the global title, homepage H1, sale search metadata, and the broad property sale landing page. It should not be repeated mechanically on every page.

## 2. Current Metadata Map

The site uses Next.js metadata in the root app layout, dynamic metadata for `/properties`, dynamic metadata for property detail pages, and page definitions in `src/lib/seo-pages.ts` for indexable SEO landing pages. The sitemap imports `SEO_LANDING_PAGES`, so landing pages in that list are included automatically.

## 3. Bikroy-Style Pattern Reference

Bikroy's public property pages use category and location hubs, clear sale/rent grouping, listing-count style sections, buyer explanation copy, related internal links, and FAQ-style guidance. PropertyBikri should use the same structural idea without copying text, layout, or misleading inventory claims.

## 4. Keyword Rules

Use the primary phrase for broad sale pages. Use natural secondary phrases on category pages: `apartments for sale in Dhaka`, `houses for sale in Dhaka`, `lands for sale in Dhaka`, `land for sale in Dhaka`, `commercial property for sale in Dhaka`, and area combinations such as `house for sale in Gulshan` or `land for sale in Purbachal`.

Avoid hidden text, repeated keyword blocks, irrelevant city/area names, copied marketplace content, fake reviews, and doorway pages with no useful content.

## 5. Global Metadata Rules

The root metadata title should be `Houses, Lands & Apartments For Sale in Dhaka | PropertyBikri`. The root description should mention houses, lands, apartments, flats, plots, commercial properties, Dhaka, and core areas naturally in one readable sentence.

Open Graph and Twitter metadata should match the same positioning so shared links are consistent.

## 6. Search Page Metadata Rules

The sale search page `/properties?purpose=sale` should use the primary phrase in title and description. The rent search page should stay rent-focused. Filtered query pages should remain `noindex, follow` unless a clean SEO landing page exists for that exact intent.

Header menu links should point to SEO landing pages instead of raw query pages because landing pages are indexable and have useful buyer copy.

## 7. Landing Page Rules

Broad sale pages can use the full primary phrase. Category pages should stay focused:

- Apartment page: apartments/flats for sale in Dhaka.
- House page: houses, villas, duplex homes for sale in Dhaka.
- Land page: lands, land, plots for sale in Dhaka.
- Commercial page: commercial property, office, shop, showroom search intent.

Each page should include a practical intro, matching listings, buyer notes, FAQs, and related internal links.

## 8. Listing Detail Metadata Rules

Listing detail metadata should build a relevant phrase from the property type and location:

- Apartment: `apartment for sale in {area}, Dhaka`
- House/villa: `house for sale in {area}, Dhaka`
- Land: `land for sale in {area}, Dhaka`
- Commercial/office/shop: `commercial property for sale in {area}, Dhaka`

Do not append the full primary phrase to every listing. Listing pages should read like real property pages, not keyword templates.

## 9. New Listing Writing Rules

The listing form should guide users toward clear titles such as `3 Bed Apartment for Sale in Bashundhara`, `House for Sale in Gulshan`, `Land for Sale in Purbachal`, and `Commercial Property for Sale in Badda`.

Descriptions should include area, size, bedrooms when relevant, road access, parking, document readiness, handover status, and the buyer use case. Do not auto-rewrite seller text silently.

## 10. Testing, Rollout, and Monitoring

Before deployment, run the frontend production build and backend script compile checks. Verify titles/descriptions for the homepage, sale search page, the four header landing pages, and representative listing detail pages.

After deployment, confirm live pages return `200`, sitemap XML parses, SEO landing pages are included in the sitemap, and filtered query pages remain noindex where appropriate. Monitor Google Search Console after recrawl for title rewrites, duplicate title warnings, and indexed landing page coverage.
