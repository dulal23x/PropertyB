/**
 * Server-Side Rendered Properties Search & Filter Page
 */

import { renderHtmlDocument, escapeHtml } from "./html-template";
import { renderPropertyCardHtml } from "./render-home";
import { ListingsRepository, type PublicSearchFilters } from "../db/repositories/listings.repo";
import type { ListingPurpose, PropertyType } from "../types/models";
import type { AppEnv } from "../types/env";

export async function renderPropertiesPage(req: Request, env: AppEnv): Promise<Response> {
  const url = new URL(req.url);
  const params = url.searchParams;

  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = 12;

  const purpose = (params.get("listing_purpose") || params.get("purpose") || "sale") as ListingPurpose;
  const propertyType = (params.get("property_type") || params.get("type") || "") as PropertyType;
  const location = params.get("location") || params.get("area_name") || "";
  const minPrice = params.get("min_price") ? Number(params.get("min_price")) : undefined;
  const maxPrice = params.get("max_price") ? Number(params.get("max_price")) : undefined;
  const bedrooms = params.get("bedrooms") ? Number(params.get("bedrooms")) : undefined;
  const keyword = params.get("keyword") || undefined;
  const sort = (params.get("sort") || "newest") as any;

  const filters: PublicSearchFilters = {
    keyword,
    listing_purpose: purpose,
    property_type: propertyType || undefined,
    location: location || undefined,
    min_price: minPrice,
    max_price: maxPrice,
    bedrooms,
    sort,
    page,
    page_size: pageSize,
  };

  const listingsRepo = new ListingsRepository(env.DB);
  const result = await listingsRepo.searchPublic(filters);

  const totalPages = Math.ceil(result.total / pageSize) || 1;

  // Build Pagination URLs
  const createPageUrl = (targetPage: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(targetPage));
    return `/properties?${nextParams.toString()}`;
  };

  const pageTitle = purpose === "rent"
    ? "Properties for Rent in Dhaka | Flats, Houses & Commercial | PropertyBikri"
    : "Houses, Lands & Apartments For Sale in Dhaka | PropertyBikri";

  const pageDescription = purpose === "rent"
    ? "Browse rental properties in Dhaka including flats, apartments, houses and commercial spaces with verified photos and direct contact."
    : "Browse houses, lands and apartments for sale in Dhaka with verified prices, photos and direct contact options across Gulshan, Banani, Dhanmondi, Uttara.";

  const content = `
  <div class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Breadcrumb & Header -->
      <div class="mb-6">
        <nav class="flex text-xs font-semibold text-gray-500 mb-2">
          <a href="/" class="hover:text-brand-green">Home</a>
          <span class="mx-2">&rsaquo;</span>
          <span class="text-brand-dark">Properties</span>
        </nav>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">
              ${purpose === "rent" ? "Properties For Rent" : "Properties For Sale"} in Dhaka
            </h1>
            <p class="text-xs md:text-sm text-gray-600 mt-1">
              Showing ${result.items.length > 0 ? (page - 1) * pageSize + 1 : 0} - ${Math.min(page * pageSize, result.total)} of ${result.total} verified properties
            </p>
          </div>

          <!-- Sort Select -->
          <form method="GET" class="flex items-center gap-2">
            ${Array.from(params.entries())
              .filter(([k]) => k !== "sort" && k !== "page")
              .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`)
              .join("")}
            <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Sort:</label>
            <select 
              name="sort" 
              onchange="this.form.submit()" 
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 focus:border-brand-green focus:outline-none"
            >
              <option value="newest" ${sort === "newest" ? "selected" : ""}>Newest First</option>
              <option value="price_asc" ${sort === "price_asc" ? "selected" : ""}>Price: Low to High</option>
              <option value="price_desc" ${sort === "price_desc" ? "selected" : ""}>Price: High to Low</option>
              <option value="featured_first" ${sort === "featured_first" ? "selected" : ""}>Featured First</option>
            </select>
          </form>
        </div>
      </div>

      <!-- Main Search & Results Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Filter Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark">Filters</h2>
              <a href="/properties" class="text-xs font-bold text-brand-green hover:underline">Reset All</a>
            </div>

            <form action="/properties" method="GET" class="space-y-4">
              <div>
                <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Purpose</label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="flex items-center justify-center py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${purpose === "sale" ? "bg-brand-green text-white border-brand-green" : "bg-gray-50 text-gray-700 border-gray-200"}">
                    <input type="radio" name="listing_purpose" value="sale" ${purpose === "sale" ? "checked" : ""} class="sr-only" onchange="this.form.submit()" />
                    Buy
                  </label>
                  <label class="flex items-center justify-center py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${purpose === "rent" ? "bg-brand-green text-white border-brand-green" : "bg-gray-50 text-gray-700 border-gray-200"}">
                    <input type="radio" name="listing_purpose" value="rent" ${purpose === "rent" ? "checked" : ""} class="sr-only" onchange="this.form.submit()" />
                    Rent
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value="${escapeHtml(location)}" 
                  placeholder="e.g. Gulshan, Uttara" 
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Property Type</label>
                <select 
                  name="property_type" 
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="apartment" ${propertyType === "apartment" ? "selected" : ""}>Apartment</option>
                  <option value="house" ${propertyType === "house" ? "selected" : ""}>House</option>
                  <option value="land" ${propertyType === "land" ? "selected" : ""}>Land</option>
                  <option value="commercial" ${propertyType === "commercial" ? "selected" : ""}>Commercial</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Bedrooms</label>
                <select 
                  name="bedrooms" 
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="1" ${bedrooms === 1 ? "selected" : ""}>1+ Bed</option>
                  <option value="2" ${bedrooms === 2 ? "selected" : ""}>2+ Beds</option>
                  <option value="3" ${bedrooms === 3 ? "selected" : ""}>3+ Beds</option>
                  <option value="4" ${bedrooms === 4 ? "selected" : ""}>4+ Beds</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1">Max Price (BDT)</label>
                <select 
                  name="max_price" 
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                >
                  <option value="">Any Price</option>
                  <option value="5000000" ${maxPrice === 5000000 ? "selected" : ""}>50 Lakhs</option>
                  <option value="10000000" ${maxPrice === 10000000 ? "selected" : ""}>1 Crore</option>
                  <option value="25000000" ${maxPrice === 25000000 ? "selected" : ""}>2.5 Crore</option>
                  <option value="50000000" ${maxPrice === 50000000 ? "selected" : ""}>5 Crore</option>
                  <option value="100000000" ${maxPrice === 100000000 ? "selected" : ""}>10 Crore</option>
                </select>
              </div>

              <button 
                type="submit" 
                class="w-full bg-brand-green text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-colors shadow"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        <!-- Listings Grid & Results -->
        <div class="lg:col-span-3">
          ${
            result.items.length === 0
              ? `
            <div class="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              <h3 class="mt-4 text-lg font-bold text-gray-900">No properties found</h3>
              <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria to find available listings.</p>
              <div class="mt-6">
                <a href="/properties" class="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-wider rounded-md shadow-sm text-white bg-brand-green hover:bg-brand-greenHover">
                  Clear All Filters
                </a>
              </div>
            </div>`
              : `
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              ${result.items.map((p) => renderPropertyCardHtml(p)).join("")}
            </div>

            <!-- Pagination -->
            ${
              totalPages > 1
                ? `
            <div class="mt-10 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
              <div class="flex flex-1 justify-between sm:hidden">
                ${page > 1 ? `<a href="${createPageUrl(page - 1)}" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</a>` : "<div></div>"}
                ${page < totalPages ? `<a href="${createPageUrl(page + 1)}" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</a>` : "<div></div>"}
              </div>
              <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs text-gray-700 font-semibold">
                    Page <span class="font-bold">${page}</span> of <span class="font-bold">${totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    ${page > 1 ? `<a href="${createPageUrl(page - 1)}" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"><span class="sr-only">Previous</span>&lsaquo;</a>` : ""}
                    ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pNum = i + 1;
                      const isCurrent = pNum === page;
                      return `<a href="${createPageUrl(pNum)}" class="relative inline-flex items-center px-4 py-2 text-xs font-bold ${isCurrent ? "z-10 bg-brand-green text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green" : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"}">${pNum}</a>`;
                    }).join("")}
                    ${page < totalPages ? `<a href="${createPageUrl(page + 1)}" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"><span class="sr-only">Next</span>&rsaquo;</a>` : ""}
                  </nav>
                </div>
              </div>
            </div>`
                : ""
            }
          `
          }
        </div>
      </div>
    </div>
  </div>`;

  const html = renderHtmlDocument({
    meta: {
      title: pageTitle,
      description: pageDescription,
      canonical: `/properties?purpose=${purpose}`,
    },
    content,
  });

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
