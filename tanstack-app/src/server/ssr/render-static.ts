/**
 * Server-Side Rendered Static & Corporate Pages
 */

import { renderHtmlDocument, escapeHtml } from "./html-template";
import type { AppEnv } from "../types/env";

export function renderStaticPage(pathname: string, env: AppEnv): Response | null {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, "");

  switch (cleanPath) {
    case "about":
      return new Response(
        renderHtmlDocument({
          meta: {
            title: "About Us | PropertyBikri - Leading Real Estate Platform in Bangladesh",
            description: "Learn about PropertyBikri, a concern of ABCBangla24 Group, committed to delivering verified, authentic real estate listings across Bangladesh.",
            canonical: "/about",
          },
          content: `
          <div class="bg-gray-50 min-h-screen py-12 md:py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
                <span class="text-xs font-black uppercase tracking-widest text-brand-green mb-2 block">About PropertyBikri</span>
                <h1 class="text-3xl md:text-4xl font-black text-brand-dark tracking-tight mb-6">
                  Empowering Real Estate Decisions Across Bangladesh
                </h1>
                <div class="prose max-w-none text-gray-700 text-sm md:text-base leading-relaxed space-y-4">
                  <p>
                    PropertyBikri is one of Bangladesh's dedicated real estate platforms, connecting property buyers, sellers, tenants, and developers through verified listings and direct communication.
                  </p>
                  <p>
                    As a proud concern of <strong>ABCBangla24 Group</strong>, PropertyBikri focuses on transparency, verified listing information, accurate pricing data, and responsive client support.
                  </p>
                  <h2 class="text-xl font-bold text-brand-dark pt-4">Our Core Mission</h2>
                  <p>
                    To simplify real estate exploration by eliminating fake listings, providing transparent price details, and ensuring buyers and sellers can connect directly with verified representatives.
                  </p>
                  <h2 class="text-xl font-bold text-brand-dark pt-4">Corporate Office</h2>
                  <p>
                    Level 5, Navana HR Tower-1, Gulshan Link Road, 1208, Dhaka, Bangladesh.<br />
                    Phone: +8801717-849009 | Email: info@propertybikri.com
                  </p>
                </div>
              </div>
            </div>
          </div>`,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );

    case "contact":
      return new Response(
        renderHtmlDocument({
          meta: {
            title: "Contact Us | PropertyBikri",
            description: "Get in touch with PropertyBikri's customer support and property advisory team.",
            canonical: "/contact",
          },
          content: `
          <div class="bg-gray-50 min-h-screen py-12 md:py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
                <span class="text-xs font-black uppercase tracking-widest text-brand-green mb-2 block">Get in Touch</span>
                <h1 class="text-3xl md:text-4xl font-black text-brand-dark tracking-tight mb-6">Contact Us</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 class="font-black text-sm uppercase tracking-wider text-brand-dark mb-2">Phone & WhatsApp</h3>
                    <p class="text-base font-bold text-brand-green">+8801717-849009</p>
                    <p class="text-xs text-gray-500 mt-1">Available 9:00 AM - 8:00 PM (Everyday)</p>
                  </div>
                  <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 class="font-black text-sm uppercase tracking-wider text-brand-dark mb-2">Office Address</h3>
                    <p class="text-sm font-semibold text-gray-800">
                      Level 5, Navana HR Tower-1, Gulshan Link Road, 1208, Dhaka
                    </p>
                  </div>
                </div>

                <form onsubmit="alert('Thank you for contacting us. We will reach out shortly.'); event.preventDefault();" class="space-y-4 border-t border-gray-100 pt-6">
                  <h3 class="text-lg font-bold text-brand-dark">Send a Message</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Your Name" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none" />
                    <input type="tel" placeholder="Phone Number" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none" />
                  </div>
                  <input type="email" placeholder="Email Address" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none" />
                  <textarea rows="4" placeholder="How can we help you?" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"></textarea>
                  <button type="submit" class="bg-brand-green text-white font-black text-xs uppercase tracking-wider py-3 px-8 rounded-lg hover:bg-brand-greenHover transition-colors shadow">
                    Submit Message
                  </button>
                </form>
              </div>
            </div>
          </div>`,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );

    case "advertise":
      return new Response(
        renderHtmlDocument({
          meta: {
            title: "Advertise with Us | PropertyBikri",
            description: "Promote your real estate developments, project launches, and verified agencies on PropertyBikri.",
            canonical: "/advertise",
          },
          content: `
          <div class="bg-gray-50 min-h-screen py-12 md:py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
                <span class="text-xs font-black uppercase tracking-widest text-brand-green mb-2 block">Developer & Agency Solutions</span>
                <h1 class="text-3xl md:text-4xl font-black text-brand-dark tracking-tight mb-6">Advertise on PropertyBikri</h1>
                <p class="text-gray-700 text-sm md:text-base leading-relaxed mb-8">
                  Reach thousands of active property buyers and investors across Bangladesh and the international diaspora.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div class="border border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <h3 class="font-bold text-base text-brand-dark mb-2">Featured Listings</h3>
                    <p class="text-xs text-gray-600">Top placement on homepage & category search results.</p>
                  </div>
                  <div class="border border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <h3 class="font-bold text-base text-brand-dark mb-2">Project Showcases</h3>
                    <p class="text-xs text-gray-600">Dedicated landing pages for newly launched developments.</p>
                  </div>
                  <div class="border border-gray-200 p-6 rounded-xl bg-gray-50 text-center">
                    <h3 class="font-bold text-base text-brand-dark mb-2">Social & Media Boost</h3>
                    <p class="text-xs text-gray-600">Cross-promotions across ABCBangla24 media network.</p>
                  </div>
                </div>
                <div class="bg-brand-green/10 border border-brand-green/20 p-6 rounded-xl text-center">
                  <h3 class="font-black text-base text-brand-dark mb-2">Contact Advertising Team</h3>
                  <p class="text-xs text-gray-700 mb-4">Direct WhatsApp & Call: +8801717-849009 | Email: ads@propertybikri.com</p>
                  <a href="https://wa.me/8801717849009?text=Interested%20in%20Advertising%20on%20PropertyBikri" target="_blank" class="inline-flex bg-brand-green text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg hover:bg-brand-greenHover">
                    Connect on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>`,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );

    case "post-property":
      return new Response(
        renderHtmlDocument({
          meta: {
            title: "Post Your Property For Sale or Rent | PropertyBikri",
            description: "List your flat, plot, house or commercial property on PropertyBikri for free and reach genuine buyers.",
            canonical: "/post-property",
          },
          content: `
          <div class="bg-gray-50 min-h-screen py-12 md:py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
                <span class="text-xs font-black uppercase tracking-widest text-brand-green mb-2 block">Sell or Rent Faster</span>
                <h1 class="text-3xl md:text-4xl font-black text-brand-dark tracking-tight mb-4">Post Your Property on PropertyBikri</h1>
                <p class="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-8">
                  Create your free account to list properties, manage photos, and receive direct inquiries from serious buyers.
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/auth/register" class="w-full sm:w-auto bg-brand-green text-white font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl hover:bg-brand-greenHover transition-all shadow-md">
                    Create Free Account & Post
                  </a>
                  <a href="/auth/login" class="w-full sm:w-auto bg-white border border-gray-300 text-brand-dark font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl hover:border-brand-green hover:text-brand-green transition-all">
                    Sign In to Existing Account
                  </a>
                </div>
              </div>
            </div>
          </div>`,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );

    case "privacy":
    case "terms":
    case "cookies":
    case "careers":
      return new Response(
        renderHtmlDocument({
          meta: {
            title: `${cleanPath.toUpperCase()} | PropertyBikri`,
            description: `Official ${cleanPath} terms and guidelines for PropertyBikri.`,
            canonical: `/${cleanPath}`,
          },
          content: `
          <div class="bg-gray-50 min-h-screen py-12 md:py-16">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
                <h1 class="text-3xl font-black text-brand-dark tracking-tight mb-6 capitalize">${cleanPath} Policy</h1>
                <div class="prose max-w-none text-gray-700 text-sm leading-relaxed space-y-4">
                  <p>PropertyBikri values trust and integrity. By using our website and services, you agree to our standard operational terms, user verification rules, and data handling policies.</p>
                  <p>All listings submitted to PropertyBikri undergo moderator review before publishing. PropertyBikri reserves the right to reject or unpublish any listing that violates transparency or copyright standards.</p>
                  <p>For questions or formal inquiries regarding these guidelines, please contact support@propertybikri.com.</p>
                </div>
              </div>
            </div>
          </div>`,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );

    default:
      return null;
  }
}
