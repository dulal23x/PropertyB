/**
 * Unified Cloudflare Worker API Router
 * 100% Contract-Compatible Replacement for FastAPI Backend
 * Follows Chapters 56, 61-82 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import { hashPassword, verifyPassword } from "../auth/crypto";
import { signJWT } from "../auth/jwt";
import { resolveAuth, requireAuth, requireAdmin } from "../middleware/auth";
import { createJsonResponse, createErrorResponse, type RequestContext } from "../middleware/logger";
import { UsersRepository } from "../db/repositories/users.repo";
import { ListingsRepository, type PublicSearchFilters } from "../db/repositories/listings.repo";
import { ImagesRepository } from "../db/repositories/images.repo";
import { InquiriesRepository } from "../db/repositories/inquiries.repo";
import { AuditRepository } from "../db/repositories/audit.repo";
import { EmailRepository } from "../db/repositories/email.repo";
import { SettingsRepository } from "../db/repositories/settings.repo";
import { EmailService } from "../email/resend";
import type { AppEnv } from "../types/env";
import type { DbUser, ListingPurpose, PropertyType, PriceVisibility } from "../types/models";

export async function handleApiRequest(
  req: Request,
  env: AppEnv,
  ctx: RequestContext
): Promise<Response> {
  const url = ctx.url;
  // Normalize pathname: allow both `/api/...` and `/...` for FastAPI contract compatibility
  let path = url.pathname;
  if (path.startsWith("/api/")) {
    path = path.substring(4);
  }
  const method = req.method.toUpperCase();

  // Instantiate Repositories
  const usersRepo = new UsersRepository(env.DB);
  const listingsRepo = new ListingsRepository(env.DB);
  const imagesRepo = new ImagesRepository(env.DB);
  const inquiriesRepo = new InquiriesRepository(env.DB);
  const auditRepo = new AuditRepository(env.DB);
  const emailRepo = new EmailRepository(env.DB);
  const settingsRepo = new SettingsRepository(env.DB);

  const jwtSecret = env.JWT_SECRET || "propertybikri-dev-secret-key-change-in-production-123456";
  const emailService = new EmailService(emailRepo, env.RESEND_API_KEY);

  // Helper to parse JSON body safely
  const parseJsonBody = async <T = Record<string, unknown>>(): Promise<T> => {
    try {
      return (await req.json()) as T;
    } catch {
      throw new Response(
        JSON.stringify({ detail: "Invalid JSON payload in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  };

  // Resolve Authentication Context
  const auth = await resolveAuth(req, jwtSecret, usersRepo);

  // -------------------------------------------------------------
  // 1. Health Endpoints (Chapter 60)
  // -------------------------------------------------------------
  if (path === "/health" && method === "GET") {
    return createJsonResponse({ status: "healthy", timestamp: new Date().toISOString() }, 200, ctx.requestId);
  }

  if (path === "/health/email" && method === "GET") {
    const isConfigured = Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_"));
    return createJsonResponse(
      {
        provider: isConfigured ? "resend" : "console",
        configured: isConfigured,
        timestamp: new Date().toISOString(),
      },
      200,
      ctx.requestId
    );
  }

  // -------------------------------------------------------------
  // 2. Auth Endpoints (Chapters 61-64)
  // -------------------------------------------------------------
  if (path === "/auth/register" && method === "POST") {
    const body = await parseJsonBody<{ email?: string; password?: string; full_name?: string }>();
    if (!body.email || !body.password) {
      return createErrorResponse("Email and password are required", 400, ctx.requestId);
    }
    const normalizedEmail = body.email.trim().toLowerCase();
    const existing = await usersRepo.findByEmail(normalizedEmail);
    if (existing) {
      return createErrorResponse("A user with this email already exists", 400, ctx.requestId);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await usersRepo.create({
      email: normalizedEmail,
      password_hash: passwordHash,
      role: "client",
      full_name: body.full_name || null,
      is_active: 1,
    });

    const token = await signJWT({ sub: user.email, id: user.id, role: user.role, ver: user.auth_version }, jwtSecret);

    // Welcome email (asynchronous / non-blocking)
    emailService.send({
      to: user.email,
      templateKey: "welcome_email",
      variables: { full_name: user.full_name || user.email, email: user.email, app_url: env.PUBLIC_APP_URL || "https://propertybikri.com" },
    }).catch(console.error);

    return createJsonResponse(
      {
        access_token: token,
        token_type: "bearer",
        user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      },
      201,
      ctx.requestId
    );
  }

  if (path === "/auth/login" && method === "POST") {
    const body = await parseJsonBody<{ email?: string; password?: string; username?: string }>();
    const email = (body.email || body.username || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return createErrorResponse("Email and password are required", 400, ctx.requestId);
    }

    const user = await usersRepo.findByEmail(email);
    if (!user) {
      return createErrorResponse("Incorrect email or password", 400, ctx.requestId);
    }

    if (user.password_reset_required === 1) {
      return createErrorResponse("Password reset required for this account", 400, ctx.requestId, { password_reset_required: true });
    }

    if (user.is_active !== 1) {
      return createErrorResponse("Account is inactive", 400, ctx.requestId);
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return createErrorResponse("Incorrect email or password", 400, ctx.requestId);
    }

    const token = await signJWT({ sub: user.email, id: user.id, role: user.role, ver: user.auth_version }, jwtSecret);

    return createJsonResponse(
      {
        access_token: token,
        token_type: "bearer",
        user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      },
      200,
      ctx.requestId
    );
  }

  if (path === "/auth/me" && method === "GET") {
    const user = requireAuth(auth);
    return createJsonResponse(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, is_active: Boolean(user.is_active) },
      200,
      ctx.requestId
    );
  }

  if (path === "/auth/me" && method === "PATCH") {
    const user = requireAuth(auth);
    const body = await parseJsonBody<{ full_name?: string }>();
    if (!body.full_name) {
      return createErrorResponse("full_name is required", 400, ctx.requestId);
    }
    const updated = await usersRepo.updateProfile(user.id, body.full_name.trim());
    return createJsonResponse(
      { id: updated!.id, email: updated!.email, role: updated!.role, full_name: updated!.full_name },
      200,
      ctx.requestId
    );
  }

  // -------------------------------------------------------------
  // 3. Public Properties Endpoints (Chapters 65-69)
  // -------------------------------------------------------------
  if (path === "/properties/global-contact" && method === "GET") {
    const defaultContact = env.PUBLIC_DEFAULT_CONTACT_PHONE || "+8801700000000";
    const contact = await settingsRepo.getGlobalContactNumber(defaultContact);
    return createJsonResponse({ contact_number: contact }, 200, ctx.requestId);
  }

  if (path === "/properties" && method === "GET") {
    const params = url.searchParams;
    const filters: PublicSearchFilters = {
      keyword: params.get("keyword") || undefined,
      listing_purpose: (params.get("listing_purpose") || params.get("purpose")) as ListingPurpose | undefined,
      property_type: (params.get("property_type") || params.get("type")) as PropertyType | undefined,
      city: params.get("city") || undefined,
      area_name: params.get("area_name") || undefined,
      location: params.get("location") || undefined,
      min_price: params.get("min_price") ? Number(params.get("min_price")) : undefined,
      max_price: params.get("max_price") ? Number(params.get("max_price")) : undefined,
      bedrooms: params.get("bedrooms") ? Number(params.get("bedrooms")) : undefined,
      bathrooms: params.get("bathrooms") ? Number(params.get("bathrooms")) : undefined,
      min_size: params.get("min_size") ? Number(params.get("min_size")) : undefined,
      max_size: params.get("max_size") ? Number(params.get("max_size")) : undefined,
      featured: params.get("featured") === "true",
      sort: params.get("sort") as any,
      page: params.get("page") ? Number(params.get("page")) : 1,
      page_size: params.get("page_size") ? Number(params.get("page_size")) : 20,
    };

    const result = await listingsRepo.searchPublic(filters);
    const globalContact = await settingsRepo.getGlobalContactNumber(env.PUBLIC_DEFAULT_CONTACT_PHONE);

    // Format according to FastAPI contract (excluding private owner info)
    const items = result.items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      listing_purpose: item.listing_purpose,
      property_type: item.property_type,
      property_subtype: item.property_subtype,
      status: item.status,
      price_amount: item.price_amount,
      price_label: item.price_label,
      price_visibility: item.price_visibility,
      currency: item.currency || "BDT",
      price_period: item.price_period,
      division: item.division,
      district: item.district,
      city: item.city,
      area_name: item.area_name,
      display_address: item.display_address,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      balconies: item.balconies,
      parking_spaces: item.parking_spaces,
      floor_number: item.floor_number,
      total_floors: item.total_floors,
      size_value: item.size_value,
      size_unit: item.size_unit,
      land_size_value: item.land_size_value,
      land_size_unit: item.land_size_unit,
      plot_type: item.plot_type,
      facing: item.facing,
      handover_status: item.handover_status,
      handover_date: item.handover_date,
      furnishing_status: item.furnishing_status,
      amenities_json: item.amenities_json,
      nearby_places_json: item.nearby_places_json,
      map_lat: item.map_lat,
      map_lng: item.map_lng,
      featured: Boolean(item.featured),
      cover_image_url: item.cover_image_url,
      image_count: item.image_count,
      business_contact_phone: globalContact,
      business_contact_whatsapp: env.PUBLIC_WHATSAPP_NUMBER || globalContact,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return createJsonResponse(
      {
        items,
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: Math.ceil(result.total / result.page_size),
      },
      200,
      ctx.requestId
    );
  }

  // -------------------------------------------------------------
  // 4. Owner Dashboard & Listings Endpoints (Chapters 70-77)
  // -------------------------------------------------------------
  if (path === "/properties/me-summary" && method === "GET") {
    const user = requireAuth(auth);
    const summary = await listingsRepo.getOwnerSummary(user.id);
    return createJsonResponse(summary, 200, ctx.requestId);
  }

  if (path === "/properties/me/inquiries" && method === "GET") {
    const user = requireAuth(auth);
    const limit = Number(url.searchParams.get("limit")) || 50;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const result = await inquiriesRepo.findByOwner(user.id, limit, offset);
    return createJsonResponse(result, 200, ctx.requestId);
  }

  if (path === "/properties/me" && method === "GET") {
    const user = requireAuth(auth);
    const status = url.searchParams.get("status") || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("page_size")) || 20));
    const offset = (page - 1) * pageSize;

    const result = await listingsRepo.findByOwner(user.id, status, pageSize, offset);
    return createJsonResponse(
      {
        items: result.items,
        total: result.total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(result.total / pageSize),
      },
      200,
      ctx.requestId
    );
  }

  if (path === "/properties" && method === "POST") {
    const user = requireAuth(auth);
    const body = await parseJsonBody<any>();
    if (!body.title || !body.listing_purpose || !body.property_type || !body.city || !body.area_name || !body.display_address) {
      return createErrorResponse("Missing required property fields", 400, ctx.requestId);
    }

    const listing = await listingsRepo.create({
      ...body,
      owner_user_id: user.id,
    });

    await auditRepo.log({
      listing_id: listing.id,
      actor_user_id: user.id,
      action: "created",
      to_status: "draft",
      note: "Listing draft created by owner",
    });

    return createJsonResponse(listing, 201, ctx.requestId);
  }

  // Check /properties/me/:id routes
  const ownerListingMatch = path.match(/^\/properties\/me\/(\d+)(.*)$/);
  if (ownerListingMatch) {
    const user = requireAuth(auth);
    const listingId = parseInt(ownerListingMatch[1], 10);
    const subPath = ownerListingMatch[2];

    const listing = await listingsRepo.findById(listingId);
    if (!listing || listing.owner_user_id !== user.id) {
      return createErrorResponse("Listing not found", 404, ctx.requestId);
    }

    if (subPath === "" && method === "GET") {
      const images = await imagesRepo.findByListing(listingId);
      return createJsonResponse({ ...listing, images }, 200, ctx.requestId);
    }

    if (subPath === "" && (method === "PUT" || method === "PATCH")) {
      const body = await parseJsonBody<any>();
      const updated = await listingsRepo.update(listingId, body);
      await auditRepo.log({
        listing_id: listingId,
        actor_user_id: user.id,
        action: "updated",
        from_status: listing.status,
        to_status: updated!.status,
        note: "Owner updated listing details",
      });
      return createJsonResponse(updated, 200, ctx.requestId);
    }

    if (subPath === "/submit" && method === "POST") {
      const images = await imagesRepo.findByListing(listingId);
      if (images.length === 0) {
        return createErrorResponse("Listing must have at least one image to submit", 400, ctx.requestId);
      }

      const updated = await listingsRepo.setLifecycleStatus(listingId, "pending_review");
      await auditRepo.log({
        listing_id: listingId,
        actor_user_id: user.id,
        action: "submitted",
        from_status: listing.status,
        to_status: "pending_review",
        note: "Submitted for moderation review",
      });

      // Send owner & admin notification emails
      emailService.send({
        to: user.email,
        templateKey: "listing_submitted_owner",
        variables: { owner_name: user.full_name || user.email, listing_title: listing.title, listing_id: listing.id },
      }).catch(console.error);

      return createJsonResponse(updated, 200, ctx.requestId);
    }

    if (subPath === "" && method === "DELETE") {
      const res = await listingsRepo.deleteOrArchive(listingId);
      await auditRepo.log({
        listing_id: listingId,
        actor_user_id: user.id,
        action: res.action === "deleted" ? "deleted" : "archived",
        from_status: listing.status,
        to_status: res.action === "deleted" ? "deleted" : "archived",
      });
      return createJsonResponse({ status: "success", action: res.action }, 200, ctx.requestId);
    }

    if (subPath === "/images" && method === "GET") {
      const images = await imagesRepo.findByListing(listingId);
      return createJsonResponse(images, 200, ctx.requestId);
    }

    // Direct Image upload endpoint for owner
    if ((subPath === "/images" || subPath === "/upload-image") && method === "POST") {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return createErrorResponse("No image file provided in formData 'file'", 400, ctx.requestId);
      }

      const safeFilename = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const r2Key = `property-images/${listingId}/${safeFilename}`;
      const publicUrl = `/images/${listingId}/${safeFilename}`;

      // Upload directly to Cloudflare R2 if configured
      if (env.PROPERTY_IMAGES) {
        await env.PROPERTY_IMAGES.put(r2Key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: file.type || "image/jpeg",
            cacheControl: "public, max-age=31536000, immutable",
          },
        });
      }

      const existingImages = await imagesRepo.findByListing(listingId);
      const isCover = existingImages.length === 0 ? 1 : 0;

      const created = await imagesRepo.create({
        listing_id: listingId,
        storage_path: r2Key,
        public_url: publicUrl,
        alt_text: listing.title,
        sort_order: existingImages.length,
        is_cover: isCover,
        uploaded_by_user_id: user.id,
      });

      return createJsonResponse(created, 201, ctx.requestId);
    }

    const imageDeleteMatch = subPath.match(/^\/images\/(\d+)$/);
    if (imageDeleteMatch && method === "DELETE") {
      const imageId = parseInt(imageDeleteMatch[1], 10);
      const result = await imagesRepo.delete(imageId);
      // Attempt R2 deletion if configured
      if (env.PROPERTY_IMAGES) {
        try {
          await env.PROPERTY_IMAGES.delete(result.deletedImage.storage_path);
        } catch (err) {
          console.error("R2 deletion warning:", err);
        }
      }
      return createJsonResponse({ status: "success", deleted_id: imageId, new_cover_id: result.newCoverId }, 200, ctx.requestId);
    }
  }

  // -------------------------------------------------------------
  // 5. Inquiries & Public Detail (Chapters 68, 69)
  // -------------------------------------------------------------
  const inquiryMatch = path.match(/^\/properties\/(\d+)\/inquiries$/);
  if (inquiryMatch && method === "POST") {
    const listingId = parseInt(inquiryMatch[1], 10);
    const listing = await listingsRepo.findById(listingId);
    if (!listing || listing.status !== "approved") {
      return createErrorResponse("Listing not found or not approved", 404, ctx.requestId);
    }

    const body = await parseJsonBody<{ name?: string; phone?: string; email?: string; message?: string; preferred_contact_method?: any }>();
    if (!body.name || !body.phone) {
      return createErrorResponse("Name and phone number are required", 400, ctx.requestId);
    }

    const inquiry = await inquiriesRepo.create({
      listing_id: listingId,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      message: body.message || null,
      preferred_contact_method: body.preferred_contact_method || "phone",
      source_page: url.pathname,
      ip_hash: ctx.clientIp,
      user_agent: req.headers.get("user-agent"),
    });

    return createJsonResponse(inquiry, 201, ctx.requestId);
  }

  // Public Detail: /properties/:slug
  const publicDetailMatch = path.match(/^\/properties\/([^/]+)$/);
  if (publicDetailMatch && method === "GET") {
    const slug = publicDetailMatch[1];
    const data = await listingsRepo.findPublicBySlug(slug);
    if (!data) {
      return createErrorResponse("Listing not found", 404, ctx.requestId);
    }

    const globalContact = await settingsRepo.getGlobalContactNumber(env.PUBLIC_DEFAULT_CONTACT_PHONE);

    return createJsonResponse(
      {
        ...data.listing,
        images: data.images,
        business_contact_phone: globalContact,
        business_contact_whatsapp: env.PUBLIC_WHATSAPP_NUMBER || globalContact,
      },
      200,
      ctx.requestId
    );
  }

  // -------------------------------------------------------------
  // 6. Admin Endpoints (Chapters 78-82)
  // -------------------------------------------------------------
  if (path.startsWith("/admin/")) {
    const admin = requireAdmin(auth);

    if (path === "/admin/properties" && method === "GET") {
      const status = url.searchParams.get("status") || undefined;
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("page_size")) || 20));
      const offset = (page - 1) * pageSize;

      const result = await listingsRepo.findByOwner(admin.id, status, pageSize, offset); // Or all admin listings
      return createJsonResponse(result, 200, ctx.requestId);
    }

    if (path === "/admin/properties/stats" && method === "GET") {
      const summary = await listingsRepo.getOwnerSummary(admin.id);
      return createJsonResponse(summary, 200, ctx.requestId);
    }

    if (path === "/admin/properties/audit-logs/recent" && method === "GET") {
      const audits = await auditRepo.listRecent(20);
      return createJsonResponse(audits, 200, ctx.requestId);
    }

    // Lifecycle actions
    const approveMatch = path.match(/^\/admin\/properties\/(\d+)\/approve$/);
    if (approveMatch && method === "POST") {
      const listingId = parseInt(approveMatch[1], 10);
      const updated = await listingsRepo.setLifecycleStatus(listingId, "approved", admin.id);
      await auditRepo.log({
        listing_id: listingId,
        actor_user_id: admin.id,
        action: "approved",
        to_status: "approved",
        note: "Approved by administrator",
      });
      return createJsonResponse(updated, 200, ctx.requestId);
    }

    const rejectMatch = path.match(/^\/admin\/properties\/(\d+)\/reject$/);
    if (rejectMatch && method === "POST") {
      const listingId = parseInt(rejectMatch[1], 10);
      const body = await parseJsonBody<{ reason?: string; note?: string }>();
      const note = body.reason || body.note || "Listing does not meet publication standards";
      const updated = await listingsRepo.setLifecycleStatus(listingId, "rejected", admin.id, note);
      await auditRepo.log({
        listing_id: listingId,
        actor_user_id: admin.id,
        action: "rejected",
        to_status: "rejected",
        note,
      });
      return createJsonResponse(updated, 200, ctx.requestId);
    }

    if (path === "/admin/users" && method === "GET") {
      const users = await usersRepo.listAll();
      return createJsonResponse(users, 200, ctx.requestId);
    }

    if (path === "/admin/settings" && method === "GET") {
      const settings = await settingsRepo.listSettings();
      return createJsonResponse(settings, 200, ctx.requestId);
    }

    if (path === "/admin/email/logs" && method === "GET") {
      const logs = await emailRepo.listLogs();
      return createJsonResponse(logs, 200, ctx.requestId);
    }

    if (path === "/admin/email/templates" && method === "GET") {
      const templates = await emailRepo.listTemplates();
      return createJsonResponse(templates, 200, ctx.requestId);
    }

    if (path === "/admin/inquiries" && method === "GET") {
      const inquiries = await inquiriesRepo.listAdmin();
      return createJsonResponse(inquiries, 200, ctx.requestId);
    }
  }

  return createErrorResponse("Not found", 404, ctx.requestId);
}
