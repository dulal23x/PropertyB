/**
 * Server-Side Rendered Homepage
 */

import { renderHtmlDocument, escapeHtml } from "./html-template";
import { ListingsRepository } from "../db/repositories/listings.repo";
import { formatBDT } from "../../utils/formatters";
import type { AppEnv } from "../types/env";

export async function renderHomePage(env: AppEnv): Promise<Response> {
  const listingsRepo = new ListingsRepository(env.DB);
  const featuredResult = await listingsRepo.searchPublic({
    featured: true,
    page_size: 6,
    sort: "newest",
  });

  const featuredProperties = featuredResult.items.length > 0
    ? featuredResult.items
    : (await listingsRepo.searchPublic({ page_size: 6 })).items;

  const content = `
  <div class="bg-white min-h-screen">
    <!-- Hero Section -->
    <section class="relative min-h-[580px] md:min-h-[640px] flex items-center justify-center overflow-hidden bg-gray-900">
      <img 
        src="/assets/home/hero/hero-bg.jpg" 
        alt="PropertyBikri Hero Background" 
        class="absolute inset-0 w-full h-full object-cover object-center opacity-40"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
      
      <div class="relative z-10 w-full max-w-5xl px-4 py-16 text-center">
        <h1 class="mx-auto mb-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg md:text-5xl">
          Houses, Lands & Apartments For Sale in Dhaka
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-base text-gray-200 md:text-lg">
          Browse verified real estate listings with direct contact options across Dhaka's top locations.
        </p>
        
        <!-- Hero Search Widget -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden text-left max-w-4xl mx-auto border border-gray-100">
          <div class="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <button type="button" onclick="setHeroTab('sale')" id="tab-sale" class="hero-tab py-3.5 text-center text-xs font-black uppercase tracking-wider text-brand-green bg-white border-b-2 border-brand-green transition-all">
              Buy
            </button>
            <button type="button" onclick="setHeroTab('rent')" id="tab-rent" class="hero-tab py-3.5 text-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-brand-dark transition-all">
              Rent
            </button>
            <button type="button" onclick="setHeroTab('commercial')" id="tab-commercial" class="hero-tab py-3.5 text-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-brand-dark transition-all">
              Commercial
            </button>
          </div>

          <form action="/properties" method="GET" class="p-4 md:p-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <input type="hidden" name="listing_purpose" id="hero-purpose-input" value="sale" />
            
            <div>
              <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Location</label>
              <input 
                type="text" 
                name="location" 
                placeholder="e.g. Gulshan, Dhanmondi" 
                class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-semibold text-brand-dark placeholder-gray-400 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>

            <div>
              <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Property Type</label>
              <select 
                name="property_type" 
                class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-semibold text-brand-dark focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment / Flat</option>
                <option value="house">House / Villa</option>
                <option value="land">Plot / Land</option>
                <option value="commercial">Commercial Space</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Max Price (BDT)</label>
              <select 
                name="max_price" 
                class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-semibold text-brand-dark focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              >
                <option value="">Any Price</option>
                <option value="5000000">Up to 50 Lakh</option>
                <option value="10000000">Up to 1 Crore</option>
                <option value="25000000">Up to 2.5 Crore</option>
                <option value="50000000">Up to 5 Crore</option>
              </select>
            </div>

            <div>
              <button 
                type="submit" 
                class="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-green py-2.5 px-6 text-sm font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-brand-greenHover hover:shadow-lg active:scale-95"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Find Properties
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Popular Cities Section -->
    <section class="py-14 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">Browse By City</h2>
            <p class="text-sm text-gray-600 mt-1">Explore top residential and commercial hubs in Bangladesh</p>
          </div>
          <a href="/properties" class="text-xs font-black uppercase tracking-wider text-brand-green hover:underline">View All &rarr;</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/properties?city=Dhaka" class="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
            <img src="/assets/home/cities/dhaka.jpg" alt="Dhaka City" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white">
              <span class="text-[10px] font-black uppercase tracking-widest text-brand-green">Primary Market</span>
              <h3 class="text-3xl font-black tracking-tight mt-1">Dhaka</h3>
            </div>
          </a>

          <a href="/properties?city=Chattogram" class="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
            <img src="/assets/home/cities/chattogram.jpg" alt="Chattogram City" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white">
              <span class="text-[10px] font-black uppercase tracking-widest text-brand-green">Port City</span>
              <h3 class="text-3xl font-black tracking-tight mt-1">Chattogram</h3>
            </div>
          </a>

          <a href="/properties?city=Sylhet" class="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500">
            <img src="/assets/home/cities/sylhet.jpg" alt="Sylhet City" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-6 left-6 text-white">
              <span class="text-[10px] font-black uppercase tracking-widest text-brand-green">Scenic Living</span>
              <h3 class="text-3xl font-black tracking-tight mt-1">Sylhet</h3>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Property Types Grid -->
    <section class="py-14 md:py-16 bg-gray-50 border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark mb-8 text-center md:text-left">
          Browse by Property Type
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/properties?property_type=apartment" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center group">
            <div class="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-3 group-hover:bg-brand-green group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 class="font-bold text-brand-dark text-base group-hover:text-brand-green transition-colors">Apartments</h3>
            <span class="text-xs text-gray-500 mt-1">Flats & Condos</span>
          </a>

          <a href="/properties?property_type=house" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center group">
            <div class="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-3 group-hover:bg-brand-green group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
            <h3 class="font-bold text-brand-dark text-base group-hover:text-brand-green transition-colors">Houses & Villas</h3>
            <span class="text-xs text-gray-500 mt-1">Independent Homes</span>
          </a>

          <a href="/properties?property_type=land" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center group">
            <div class="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-3 group-hover:bg-brand-green group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            </div>
            <h3 class="font-bold text-brand-dark text-base group-hover:text-brand-green transition-colors">Plots & Land</h3>
            <span class="text-xs text-gray-500 mt-1">Residential & Commercial</span>
          </a>

          <a href="/properties?property_type=commercial" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center group">
            <div class="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-3 group-hover:bg-brand-green group-hover:text-white transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
            </div>
            <h3 class="font-bold text-brand-dark text-base group-hover:text-brand-green transition-colors">Commercial</h3>
            <span class="text-xs text-gray-500 mt-1">Offices & Shops</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Verified Listings Section -->
    <section class="py-14 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">Featured Properties</h2>
            <p class="text-sm text-gray-600 mt-1">Handpicked verified properties ready for purchase</p>
          </div>
          <a href="/properties?featured=true" class="text-xs font-black uppercase tracking-wider text-brand-green hover:underline">View All Featured &rarr;</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          ${featuredProperties.map((p) => renderPropertyCardHtml(p)).join("")}
        </div>
      </div>
    </section>

    <!-- Area Links / SEO Hub -->
    <section class="py-14 bg-gray-50 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-black uppercase tracking-tight text-brand-dark mb-6">Popular Dhaka Locations</h2>
        <div class="flex flex-wrap gap-2.5">
          ${[
            { name: "Gulshan", slug: "flat-for-sale-in-gulshan" },
            { name: "Banani", slug: "flat-for-sale-in-banani" },
            { name: "Dhanmondi", slug: "flat-for-sale-in-dhanmondi" },
            { name: "Uttara", slug: "flat-for-sale-in-uttara" },
            { name: "Bashundhara R/A", slug: "flat-for-sale-in-bashundhara" },
            { name: "Baridhara", slug: "flat-for-sale-in-baridhara" },
            { name: "Mirpur", slug: "flat-for-sale-in-mirpur" },
            { name: "Mohammadpur", slug: "flat-for-sale-in-mohammadpur" },
            { name: "Purbachal", slug: "land-for-sale-in-purbachal" },
            { name: "Aftab Nagar", slug: "flat-for-sale-in-aftab-nagar" },
            { name: "Badda", slug: "flat-for-sale-in-badda" },
            { name: "Wari", slug: "flat-for-sale-in-wari" },
          ]
            .map(
              (area) => `
            <a href="/${area.slug}" class="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 hover:border-brand-green hover:text-brand-green shadow-sm transition-colors">
              ${area.name}
            </a>`
            )
            .join("")}
        </div>
      </div>
    </section>
  </div>`;

  const scripts = `
  <script>
    function setHeroTab(tab) {
      document.querySelectorAll('.hero-tab').forEach(el => {
        el.classList.remove('text-brand-green', 'bg-white', 'border-b-2', 'border-brand-green');
        el.classList.add('text-gray-500');
      });
      const activeEl = document.getElementById('tab-' + tab);
      if (activeEl) {
        activeEl.classList.remove('text-gray-500');
        activeEl.classList.add('text-brand-green', 'bg-white', 'border-b-2', 'border-brand-green');
      }
      const purposeInput = document.getElementById('hero-purpose-input');
      if (purposeInput) {
        purposeInput.value = tab === 'rent' ? 'rent' : 'sale';
      }
    }
  </script>`;

  const html = renderHtmlDocument({
    meta: {
      title: "Houses, Lands & Apartments For Sale in Dhaka | PropertyBikri",
      description: "Browse houses, lands and apartments for sale in Dhaka with verified prices, photos and direct contact options across Gulshan, Banani, Bashundhara, Uttara and Dhanmondi.",
      canonical: "/",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PropertyBikri",
        url: "https://propertybikri.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://propertybikri.com/properties?keyword={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    },
    content,
    scripts,
  });

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function renderPropertyCardHtml(p: any): string {
  const isCall = p.price_visibility === "call_for_price" || p.price_visibility === "contact_for_price";
  const priceDisplay = isCall
    ? (p.price_label || "Call for details")
    : `${p.currency || "BDT"} ${formatBDT(p.price_amount || 0)}`;

  const coverSrc = p.cover_image_url || "/assets/propertybikri-demo-call-for-details.png";
  const phone = p.business_contact_phone || "+8801700000000";
  const waPhone = (p.business_contact_whatsapp || phone).replace(/[^0-9]/g, "");

  return `
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full">
    <div class="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
      <a href="/properties/${escapeHtml(p.slug)}">
        <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </a>
      ${p.featured ? '<div class="absolute top-3 left-0 bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 uppercase tracking-wider shadow">Featured</div>' : ""}
      <div class="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        ${p.image_count || 1}
      </div>
    </div>

    <div class="p-5 flex flex-col flex-grow">
      <span class="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
        ${escapeHtml(p.property_type || "Property")} &bull; For ${escapeHtml(p.listing_purpose || "Sale")}
      </span>
      <a href="/properties/${escapeHtml(p.slug)}">
        <h3 class="text-xl font-black text-brand-dark hover:text-brand-green transition-colors leading-tight mb-1">
          ${escapeHtml(priceDisplay)}
        </h3>
      </a>
      <a href="/properties/${escapeHtml(p.slug)}">
        <h4 class="text-sm font-semibold text-gray-700 line-clamp-1 hover:text-brand-green transition-colors mb-3">
          ${escapeHtml(p.title)}
        </h4>
      </a>

      <div class="flex items-center text-xs text-gray-500 mb-4">
        <svg class="h-3.5 w-3.5 text-brand-green mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
        <span class="line-clamp-1">${escapeHtml(p.area_name || "")}, ${escapeHtml(p.city || "Dhaka")}</span>
      </div>

      <div class="flex items-center gap-4 mt-auto pt-3 border-t border-gray-100 text-xs font-bold text-gray-700">
        ${p.bedrooms ? `<span>${p.bedrooms} Beds</span>` : ""}
        ${p.bathrooms ? `<span>${p.bathrooms} Baths</span>` : ""}
        ${p.size_value ? `<span>${p.size_value} ${escapeHtml(p.size_unit || "sqft")}</span>` : ""}
      </div>

      <div class="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
        <a href="tel:${phone}" class="flex-1 py-1.5 text-center text-xs font-bold uppercase tracking-wider rounded border border-gray-200 text-gray-800 hover:border-brand-green hover:text-brand-green transition-colors">
          Call
        </a>
        <a href="https://wa.me/${waPhone}" target="_blank" rel="noopener noreferrer" class="flex-1 py-1.5 text-center text-xs font-bold uppercase tracking-wider rounded bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25 transition-colors">
          WhatsApp
        </a>
        <a href="/properties/${escapeHtml(p.slug)}" class="flex-1 py-1.5 text-center text-xs font-bold uppercase tracking-wider rounded bg-brand-green text-white hover:bg-brand-greenHover transition-colors">
          View
        </a>
      </div>
    </div>
  </div>`;
}
