/**
 * Server-Side Rendered Property Detail Page
 */

import { renderHtmlDocument, escapeHtml } from "./html-template";
import { renderPropertyCardHtml } from "./render-home";
import { ListingsRepository } from "../db/repositories/listings.repo";
import { ImagesRepository } from "../db/repositories/images.repo";
import { SettingsRepository } from "../db/repositories/settings.repo";
import { formatBDT } from "../../utils/formatters";
import type { AppEnv } from "../types/env";

export async function renderPropertyDetailPage(slug: string, env: AppEnv): Promise<Response> {
  const listingsRepo = new ListingsRepository(env.DB);
  const imagesRepo = new ImagesRepository(env.DB);
  const settingsRepo = new SettingsRepository(env.DB);

  const listing = await listingsRepo.findBySlug(slug);
  if (!listing || (listing.status !== "approved" && (listing.status as string) !== "published")) {
    return new Response(
      renderHtmlDocument({
        meta: {
          title: "Property Not Found | PropertyBikri",
          description: "The requested property listing could not be found or is no longer active.",
          noIndex: true,
        },
        content: `
        <div class="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 class="text-3xl font-black text-brand-dark mb-4">Property Not Found</h1>
          <p class="text-gray-600 mb-8">The listing you are looking for may have been sold, rented, or unpublished.</p>
          <a href="/properties" class="inline-flex items-center px-6 py-3 rounded-lg bg-brand-green text-white font-black uppercase tracking-wider text-xs hover:bg-brand-greenHover transition-colors">
            Browse All Properties
          </a>
        </div>`,
      }),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const images = await imagesRepo.findByListing(listing.id);
  const globalContact = await settingsRepo.getGlobalContactNumber(env.PUBLIC_DEFAULT_CONTACT_PHONE);
  const phone = globalContact;
  const waPhone = phone.replace(/[^0-9]/g, "");

  const isCall = listing.price_visibility === "call_for_price" || listing.price_visibility === "contact_for_price";
  const priceDisplay = isCall
    ? (listing.price_label || "Call for details")
    : `${listing.currency || "BDT"} ${formatBDT(listing.price_amount || 0)}`;

  const related = await listingsRepo.searchPublic({
    property_type: listing.property_type,
    page_size: 3,
  });
  const relatedItems = related.items.filter((p) => p.id !== listing.id).slice(0, 3);

  const mainImage = images.length > 0
    ? images[0].public_url
    : "/assets/propertybikri-demo-call-for-details.png";

  const content = `
  <div class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Breadcrumb Navigation -->
      <nav class="flex text-xs font-semibold text-gray-500 mb-6">
        <a href="/" class="hover:text-brand-green">Home</a>
        <span class="mx-2">&rsaquo;</span>
        <a href="/properties" class="hover:text-brand-green">Properties</a>
        <span class="mx-2">&rsaquo;</span>
        <a href="/properties?area_name=${encodeURIComponent(listing.area_name || "")}" class="hover:text-brand-green">${escapeHtml(listing.area_name || "Dhaka")}</a>
        <span class="mx-2">&rsaquo;</span>
        <span class="text-brand-dark line-clamp-1">${escapeHtml(listing.title)}</span>
      </nav>

      <!-- Main Property Header -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-8">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="bg-brand-green/10 text-brand-green font-black text-[11px] px-2.5 py-1 rounded uppercase tracking-wider">
                For ${escapeHtml(listing.listing_purpose)}
              </span>
              <span class="bg-gray-100 text-gray-700 font-bold text-[11px] px-2.5 py-1 rounded uppercase tracking-wider">
                ${escapeHtml(listing.property_type)}
              </span>
              ${listing.featured ? '<span class="bg-yellow-400 text-black font-black text-[11px] px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">Featured</span>' : ""}
              <span class="bg-blue-50 text-blue-700 font-bold text-[11px] px-2.5 py-1 rounded uppercase tracking-wider">
                Verified Listing
              </span>
            </div>
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-black text-brand-dark tracking-tight leading-tight">
              ${escapeHtml(listing.title)}
            </h1>
            <p class="text-sm font-medium text-gray-500 mt-2 flex items-center gap-1.5">
              <svg class="h-4 w-4 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              <span>${escapeHtml(listing.display_address || `${listing.area_name}, ${listing.city}`)}</span>
            </p>
          </div>

          <div class="lg:text-right shrink-0">
            <span class="text-xs font-black uppercase tracking-wider text-gray-500 block mb-1">Asking Price</span>
            <div class="text-3xl md:text-4xl font-black text-brand-dark text-brand-green tracking-tight">
              ${escapeHtml(priceDisplay)}
            </div>
            ${isCall ? '<span class="text-xs text-gray-500 font-semibold block mt-1">Contact listing agent for details</span>' : ""}
          </div>
        </div>
      </div>

      <!-- Grid Content Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Gallery & Details -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Image Gallery -->
          <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div class="relative aspect-[16/10] w-full bg-gray-900">
              <img 
                id="main-property-image" 
                src="${escapeHtml(mainImage)}" 
                alt="${escapeHtml(listing.title)}" 
                class="w-full h-full object-cover"
              />
            </div>
            ${
              images.length > 1
                ? `
            <div class="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 overflow-x-auto">
              ${images
                .map(
                  (img: { public_url: string }, idx: number) => `
                <button 
                  type="button" 
                  onclick="document.getElementById('main-property-image').src = '${escapeHtml(img.public_url)}'" 
                  class="relative aspect-[16/10] w-24 shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-green focus:border-brand-green transition-all"
                >
                  <img src="${escapeHtml(img.public_url)}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover" />
                </button>`
                )
                .join("")}
            </div>`
                : ""
            }
          </div>

          <!-- Overview & Key Specs Table -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 class="text-lg font-black uppercase tracking-wider text-brand-dark mb-6 pb-3 border-b border-gray-100">
              Overview & Specifications
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Bedrooms</span>
                <span class="text-lg font-black text-brand-dark">${listing.bedrooms || "N/A"}</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Bathrooms</span>
                <span class="text-lg font-black text-brand-dark">${listing.bathrooms || "N/A"}</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Property Size</span>
                <span class="text-lg font-black text-brand-dark">${listing.size_value ? `${listing.size_value} ${listing.size_unit || "sqft"}` : "N/A"}</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Property Type</span>
                <span class="text-base font-bold text-brand-dark capitalize">${escapeHtml(listing.property_type)}</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Purpose</span>
                <span class="text-base font-bold text-brand-dark capitalize">For ${escapeHtml(listing.listing_purpose)}</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span class="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-1">Location</span>
                <span class="text-base font-bold text-brand-dark">${escapeHtml(listing.area_name || listing.city)}</span>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 class="text-lg font-black uppercase tracking-wider text-brand-dark mb-4 pb-3 border-b border-gray-100">
              Description
            </h2>
            <div class="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              ${escapeHtml(listing.description || "No full description provided for this listing. Please contact the agent for complete details and floor plans.")}
            </div>
          </div>
        </div>

        <!-- Right Column: Contact & Inquiry Form -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Contact Card -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <div class="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div class="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-black text-lg">
                PB
              </div>
              <div>
                <h3 class="font-black text-sm text-brand-dark">PropertyBikri Verified Team</h3>
                <span class="text-xs text-gray-500">Official Listing Representative</span>
              </div>
            </div>

            <!-- Instant Actions -->
            <div class="space-y-3 mb-6">
              <a 
                href="tel:${phone}" 
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green py-3 px-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-brand-greenHover transition-all"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Call: ${escapeHtml(phone)}
              </a>

              <a 
                href="https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi, I am interested in: ${listing.title} (ID: ${listing.id})`)}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 px-4 text-xs font-black uppercase tracking-wider text-white shadow hover:bg-[#20bd5a] transition-all"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.84 11.84 0 0 0 12.09 0C5.48 0 .09 5.38.09 12c0 2.11.55 4.18 1.61 6L0 24l6.16-1.62A11.91 11.91 0 0 0 12.09 24C18.7 24 24 18.62 24 12c0-3.2-1.24-6.21-3.48-8.52ZM12.09 21.96c-1.82 0-3.61-.49-5.16-1.42l-.37-.22-3.65.96.98-3.56-.24-.38A9.86 9.86 0 0 1 2.13 12c0-5.5 4.47-9.96 9.96-9.96 2.66 0 5.16 1.04 7.04 2.92A9.88 9.88 0 0 1 21.96 12c0 5.5-4.38 9.96-9.87 9.96Z"/></svg>
                Chat on WhatsApp
              </a>
            </div>

            <!-- Inquiry Form -->
            <div class="border-t border-gray-100 pt-4">
              <h4 class="font-black text-xs uppercase tracking-wider text-gray-700 mb-3">Send Direct Inquiry</h4>
              <form id="inquiry-form" onsubmit="handleInquirySubmit(event, ${listing.id})" class="space-y-3">
                <div id="inquiry-msg" class="hidden text-xs p-3 rounded-lg"></div>
                <div>
                  <input 
                    type="text" 
                    id="inquiry-name" 
                    placeholder="Your Full Name" 
                    required 
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="tel" 
                    id="inquiry-phone" 
                    placeholder="Phone Number" 
                    required 
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    id="inquiry-email" 
                    placeholder="Email Address (Optional)" 
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <textarea 
                    id="inquiry-message" 
                    rows="3" 
                    placeholder="I am interested in this property. Please contact me." 
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-brand-dark focus:border-brand-green focus:outline-none"
                  >I am interested in this property. Please contact me.</textarea>
                </div>
                <button 
                  type="submit" 
                  id="inquiry-submit-btn"
                  class="w-full bg-brand-dark text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-colors shadow"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Properties -->
      ${
        relatedItems.length > 0
          ? `
      <div class="mt-16 pt-12 border-t border-gray-200">
        <h2 class="text-2xl font-black uppercase tracking-tight text-brand-dark mb-8">
          Similar Properties You May Like
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          ${relatedItems.map((p) => renderPropertyCardHtml(p)).join("")}
        </div>
      </div>`
          : ""
      }
    </div>
  </div>`;

  const scripts = `
  <script>
    async function handleInquirySubmit(e, listingId) {
      e.preventDefault();
      const btn = document.getElementById('inquiry-submit-btn');
      const msg = document.getElementById('inquiry-msg');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      const payload = {
        name: document.getElementById('inquiry-name').value,
        phone: document.getElementById('inquiry-phone').value,
        email: document.getElementById('inquiry-email').value || null,
        message: document.getElementById('inquiry-message').value || null
      };

      try {
        const res = await fetch('/api/properties/' + listingId + '/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          msg.className = 'text-xs p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 block';
          msg.textContent = 'Your inquiry has been submitted! Our team will contact you shortly.';
          document.getElementById('inquiry-form').reset();
        } else {
          msg.className = 'text-xs p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 block';
          msg.textContent = data.detail || 'Failed to send inquiry. Please try again.';
        }
      } catch (err) {
        msg.className = 'text-xs p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 block';
        msg.textContent = 'Network error. Please call directly.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Inquiry';
      }
    }
  </script>`;

  const html = renderHtmlDocument({
    meta: {
      title: `${listing.title} | PropertyBikri`,
      description: `${listing.title} in ${listing.area_name}, ${listing.city}. ${priceDisplay}. Contact PropertyBikri for verified availability.`,
      canonical: `/properties/${listing.slug}`,
      ogImage: mainImage,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: listing.title,
        description: listing.description,
        url: `https://propertybikri.com/properties/${listing.slug}`,
        image: mainImage,
        offers: {
          "@type": "Offer",
          price: listing.price_amount,
          priceCurrency: listing.currency || "BDT",
          availability: "https://schema.org/InStock",
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
