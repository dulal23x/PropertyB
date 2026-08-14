/**
 * PropertyBikri Cloudflare Worker Full-Stack Server Entry
 * Unified Server-Side Rendering (SSR), API router, R2 media delivery, and D1 database.
 */

import { handleApiRequest } from "./api/router";
import { createRequestContext, applySecurityHeaders } from "./middleware/logger";
import { renderHomePage } from "./ssr/render-home";
import { renderPropertiesPage } from "./ssr/render-properties";
import { renderPropertyDetailPage } from "./ssr/render-property-detail";
import { renderSeoLandingPage } from "./ssr/render-seo-landing";
import { renderStaticPage } from "./ssr/render-static";
import { renderAuthPage } from "./ssr/render-auth";
import { renderDashboardPage } from "./ssr/render-dashboard";
import { renderAdminPage } from "./ssr/render-admin";
import { renderSitemapXml, renderRobotsTxt } from "./ssr/render-feeds";
import { renderHtmlDocument } from "./ssr/html-template";
import type { AppEnv } from "./types/env";

export default {
  async fetch(req: Request, env: AppEnv, executionCtx: ExecutionContext): Promise<Response> {
    const ctx = createRequestContext(req);
    const url = ctx.url;
    const method = req.method.toUpperCase();
    const pathname = url.pathname;

    // 1. Handle CORS Preflight
    if (method === "OPTIONS") {
      const headers = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
        "Access-Control-Max-Age": "86400",
      });
      applySecurityHeaders(headers);
      return new Response(null, { status: 204, headers });
    }

    // 2. Handle /images/* Compatibility Route from Cloudflare R2 (Chapter 41)
    const imageMatch = pathname.match(/^\/images\/(\d+)\/([^/]+)$/);
    if (imageMatch && method === "GET") {
      const listingId = imageMatch[1];
      const filename = imageMatch[2];
      const safeFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const r2Key = `property-images/${listingId}/${safeFilename}`;

      try {
        const object = await env.PROPERTY_IMAGES.get(r2Key);
        if (!object) {
          return new Response("Image not found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Access-Control-Allow-Origin", "*");
        applySecurityHeaders(headers);

        return new Response(object.body, { headers });
      } catch (err) {
        console.error("R2 image fetch error:", err);
        return new Response("Error fetching image", { status: 500 });
      }
    }

    // 3. Crawler Feeds
    if (pathname === "/sitemap.xml" && method === "GET") {
      const resp = await renderSitemapXml(env);
      applySecurityHeaders(resp.headers);
      return resp;
    }
    if (pathname === "/robots.txt" && method === "GET") {
      const resp = renderRobotsTxt();
      applySecurityHeaders(resp.headers);
      return resp;
    }

    // 4. API Endpoints
    const isApiRoute =
      pathname.startsWith("/api") ||
      pathname.startsWith("/health") ||
      pathname.startsWith("/auth/me") ||
      (pathname.startsWith("/auth") && (method === "POST" || req.headers.get("Accept")?.includes("application/json"))) ||
      pathname.startsWith("/properties/me") ||
      (pathname.startsWith("/properties") && (method !== "GET" || req.headers.get("Accept")?.includes("application/json") || req.headers.get("Authorization") !== null)) ||
      (pathname.startsWith("/admin") && (method !== "GET" || req.headers.get("Accept")?.includes("application/json") || req.headers.get("Authorization") !== null));

    if (isApiRoute) {
      try {
        return await handleApiRequest(req, env, ctx);
      } catch (err) {
        if (err instanceof Response) {
          return err;
        }
        console.error(`[Worker Unhandled Exception] ${ctx.requestId}:`, err);
        return new Response(
          JSON.stringify({
            detail: "Internal server error",
            request_id: ctx.requestId,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": ctx.requestId,
            },
          }
        );
      }
    }

    // 5. Server-Side Rendered (SSR) HTML Frontend Pages
    try {
      // 5.1 Homepage
      if (pathname === "/" || pathname === "") {
        const resp = await renderHomePage(env);
        applySecurityHeaders(resp.headers);
        return resp;
      }

      // 5.2 Public Search / Properties Listing
      if (pathname === "/properties" || pathname === "/properties/") {
        const resp = await renderPropertiesPage(req, env);
        applySecurityHeaders(resp.headers);
        return resp;
      }

      // 5.3 Property Detail Page
      const propDetailMatch = pathname.match(/^\/properties\/([a-zA-Z0-9_\-]+)\/?$/);
      if (propDetailMatch) {
        const slug = propDetailMatch[1];
        const resp = await renderPropertyDetailPage(slug, env);
        applySecurityHeaders(resp.headers);
        return resp;
      }

      // 5.4 Authentication Pages (/auth/login, /auth/register, /auth/reset)
      if (pathname.startsWith("/auth/")) {
        const resp = renderAuthPage(pathname);
        if (resp) {
          applySecurityHeaders(resp.headers);
          return resp;
        }
      }

      // 5.5 Owner Dashboard (/dashboard/*)
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        const resp = renderDashboardPage(pathname, env);
        applySecurityHeaders(resp.headers);
        return resp;
      }

      // 5.6 Admin Portal (/admin/*)
      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        const resp = renderAdminPage(pathname, env);
        applySecurityHeaders(resp.headers);
        return resp;
      }

      // 5.7 Static & Corporate Pages
      const staticResp = renderStaticPage(pathname, env);
      if (staticResp) {
        applySecurityHeaders(staticResp.headers);
        return staticResp;
      }

      // 5.8 Programmatic SEO Landing Pages (90 pages)
      const cleanSlug = pathname.replace(/^\/+|\/+$/g, "");
      const seoResp = await renderSeoLandingPage(cleanSlug, env);
      if (seoResp) {
        applySecurityHeaders(seoResp.headers);
        return seoResp;
      }

      // 5.9 404 Fallback
      const notFoundHtml = renderHtmlDocument({
        meta: {
          title: "Page Not Found (404) | PropertyBikri",
          description: "The page you requested could not be found.",
          noIndex: true,
        },
        content: `
        <div class="max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 class="text-4xl font-black text-brand-dark mb-4">404 - Page Not Found</h1>
          <p class="text-gray-600 mb-8">We couldn't find the page you're looking for. It might have been moved or deleted.</p>
          <a href="/" class="inline-flex items-center px-6 py-3 rounded-xl bg-brand-green text-white font-black text-xs uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow">
            Return to Homepage
          </a>
        </div>`,
      });

      const notFoundResp = new Response(notFoundHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
      applySecurityHeaders(notFoundResp.headers);
      return notFoundResp;
    } catch (ssrError) {
      console.error(`[SSR Render Error] ${ctx.requestId}:`, ssrError);
      return new Response("Internal Server Error rendering page", { status: 500 });
    }
  },
};
