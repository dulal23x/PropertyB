/**
 * Property Listings D1 Repository
 * Follows Chapters 19-20, 55, 66-68, 71-75, 78-80 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbListing, DbImage, ListingPurpose, ListingStatus, PriceVisibility, PropertyType } from "../../types/models";

export interface PublicSearchFilters {
  keyword?: string;
  listing_purpose?: ListingPurpose;
  purpose?: ListingPurpose;
  property_type?: PropertyType;
  type?: PropertyType;
  city?: string;
  area_name?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_size?: number;
  max_size?: number;
  min_land_size?: number;
  max_land_size?: number;
  featured?: boolean;
  price_visibility?: PriceVisibility;
  sort?: "newest" | "price_asc" | "price_desc" | "size_asc" | "size_desc";
  page?: number;
  page_size?: number;
}

export interface PublicListingItem extends DbListing {
  cover_image_url: string | null;
  image_count: number;
}

export class ListingsRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<DbListing | null> {
    const stmt = this.db.prepare("SELECT * FROM property_listings WHERE id = ?").bind(id);
    return (await stmt.first<DbListing>()) || null;
  }

  async findBySlug(slug: string): Promise<DbListing | null> {
    const stmt = this.db.prepare("SELECT * FROM property_listings WHERE slug = ?").bind(slug);
    return (await stmt.first<DbListing>()) || null;
  }

  async findPublicBySlug(slug: string): Promise<{ listing: DbListing; images: DbImage[] } | null> {
    const listing = await this.findBySlug(slug);
    if (!listing || listing.status !== "approved") {
      return null;
    }

    const imgStmt = this.db
      .prepare(
        "SELECT * FROM property_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order ASC, id ASC"
      )
      .bind(listing.id);
    const { results } = await imgStmt.all<DbImage>();

    return {
      listing,
      images: results || [],
    };
  }

  async searchPublic(filters: PublicSearchFilters): Promise<{
    items: PublicListingItem[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const page_size = Math.min(100, Math.max(1, Number(filters.page_size) || 20));
    const offset = (page - 1) * page_size;

    const conditions: string[] = ["l.status = 'approved'"];
    const params: unknown[] = [];

    const purpose = filters.listing_purpose || filters.purpose;
    if (purpose) {
      conditions.push("l.listing_purpose = ?");
      params.push(purpose);
    }

    const pType = filters.property_type || filters.type;
    if (pType) {
      conditions.push("l.property_type = ?");
      params.push(pType);
    }

    if (filters.city) {
      conditions.push("l.city = ? COLLATE NOCASE");
      params.push(filters.city);
    }

    if (filters.area_name) {
      conditions.push("l.area_name = ? COLLATE NOCASE");
      params.push(filters.area_name);
    }

    if (filters.location) {
      conditions.push(
        "(l.city LIKE ? OR l.area_name LIKE ? OR l.display_address LIKE ?)"
      );
      const locPattern = `%${filters.location}%`;
      params.push(locPattern, locPattern, locPattern);
    }

    if (filters.keyword) {
      conditions.push(
        "(l.title LIKE ? OR l.description LIKE ? OR l.area_name LIKE ? OR l.city LIKE ?)"
      );
      const kwPattern = `%${filters.keyword}%`;
      params.push(kwPattern, kwPattern, kwPattern, kwPattern);
    }

    if (filters.min_price !== undefined) {
      conditions.push("l.price_amount >= ?");
      params.push(filters.min_price);
    }
    if (filters.max_price !== undefined) {
      conditions.push("l.price_amount <= ?");
      params.push(filters.max_price);
    }

    if (filters.bedrooms !== undefined) {
      conditions.push("l.bedrooms = ?");
      params.push(filters.bedrooms);
    } else {
      if (filters.min_bedrooms !== undefined) {
        conditions.push("l.bedrooms >= ?");
        params.push(filters.min_bedrooms);
      }
      if (filters.max_bedrooms !== undefined) {
        conditions.push("l.bedrooms <= ?");
        params.push(filters.max_bedrooms);
      }
    }

    if (filters.bathrooms !== undefined) {
      conditions.push("l.bathrooms >= ?");
      params.push(filters.bathrooms);
    }

    if (filters.min_size !== undefined) {
      conditions.push("l.size_value >= ?");
      params.push(filters.min_size);
    }
    if (filters.max_size !== undefined) {
      conditions.push("l.size_value <= ?");
      params.push(filters.max_size);
    }

    if (filters.featured) {
      conditions.push("l.featured = 1");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM property_listings l ${whereClause}`;
    const countStmt = this.db.prepare(countSql).bind(...params);
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    // Sort order
    let orderBy = "l.featured DESC, l.created_at DESC, l.id DESC";
    if (filters.sort === "price_asc") {
      orderBy = "l.price_amount ASC NULLS LAST, l.id DESC";
    } else if (filters.sort === "price_desc") {
      orderBy = "l.price_amount DESC NULLS LAST, l.id DESC";
    } else if (filters.sort === "size_asc") {
      orderBy = "l.size_value ASC NULLS LAST, l.id DESC";
    } else if (filters.sort === "size_desc") {
      orderBy = "l.size_value DESC NULLS LAST, l.id DESC";
    }

    // Single bounded query fetching listing + cover image + image count (Chapter 67 optimization)
    const listSql = `
      SELECT 
        l.*,
        (SELECT public_url FROM property_images pi WHERE pi.listing_id = l.id ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as cover_image_url,
        (SELECT COUNT(*) FROM property_images pi WHERE pi.listing_id = l.id) as image_count
      FROM property_listings l
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const listParams = [...params, page_size, offset];
    const listStmt = this.db.prepare(listSql).bind(...listParams);
    const { results } = await listStmt.all<PublicListingItem>();

    return {
      items: results || [],
      total,
      page,
      page_size,
    };
  }

  async findByOwner(
    ownerUserId: number,
    status?: string,
    limit = 50,
    offset = 0
  ): Promise<{ items: PublicListingItem[]; total: number }> {
    const conditions = ["l.owner_user_id = ?"];
    const params: unknown[] = [ownerUserId];

    if (status) {
      conditions.push("l.status = ?");
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM property_listings l ${whereClause}`).bind(...params);
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    const listSql = `
      SELECT 
        l.*,
        (SELECT public_url FROM property_images pi WHERE pi.listing_id = l.id ORDER BY pi.is_cover DESC, pi.sort_order ASC, pi.id ASC LIMIT 1) as cover_image_url,
        (SELECT COUNT(*) FROM property_images pi WHERE pi.listing_id = l.id) as image_count
      FROM property_listings l
      ${whereClause}
      ORDER BY l.updated_at DESC, l.id DESC
      LIMIT ? OFFSET ?
    `;
    const { results } = await this.db.prepare(listSql).bind(...params, limit, offset).all<PublicListingItem>();

    return { items: results || [], total };
  }

  async getOwnerSummary(ownerUserId: number): Promise<{
    total_listings: number;
    approved_count: number;
    pending_review_count: number;
    draft_count: number;
    rejected_count: number;
    needs_action_count: number;
    recent_listings: PublicListingItem[];
  }> {
    const countsStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM property_listings
      WHERE owner_user_id = ?
    `).bind(ownerUserId);

    const counts = await countsStmt.first<{
      total: number;
      approved: number;
      pending: number;
      draft: number;
      rejected: number;
    }>();

    const draft = counts?.draft || 0;
    const rejected = counts?.rejected || 0;
    const needs_action_count = draft + rejected;

    const recent = await this.findByOwner(ownerUserId, undefined, 5, 0);

    return {
      total_listings: counts?.total || 0,
      approved_count: counts?.approved || 0,
      pending_review_count: counts?.pending || 0,
      draft_count: draft,
      rejected_count: rejected,
      needs_action_count,
      recent_listings: recent.items,
    };
  }

  async create(data: Partial<DbListing> & { owner_user_id: number; title: string; listing_purpose: ListingPurpose; property_type: PropertyType; city: string; area_name: string; display_address: string }): Promise<DbListing> {
    const now = new Date().toISOString();
    const slug = data.slug || this.generateSlug(data.title);

    const stmt = this.db.prepare(`
      INSERT INTO property_listings (
        owner_user_id, title, slug, description, listing_purpose, property_type, property_subtype,
        status, price_amount, price_label, price_visibility, currency, price_period,
        division, district, city, area_name, address_line, display_address,
        bedrooms, bathrooms, balconies, parking_spaces, floor_number, total_floors,
        size_value, size_unit, land_size_value, land_size_unit, plot_type, facing,
        handover_status, handover_date, furnishing_status, amenities_json, nearby_places_json,
        map_lat, map_lng, owner_note, admin_note, featured, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        'draft', ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      ) RETURNING *
    `).bind(
      data.owner_user_id, data.title, slug, data.description || "", data.listing_purpose, data.property_type, data.property_subtype || null,
      data.price_amount || null, data.price_label || null, data.price_visibility || "show_price", data.currency || "BDT", data.price_period || null,
      data.division || null, data.district || null, data.city, data.area_name, data.address_line || null, data.display_address,
      data.bedrooms || null, data.bathrooms || null, data.balconies || null, data.parking_spaces || null, data.floor_number || null, data.total_floors || null,
      data.size_value || null, data.size_unit || "sqft", data.land_size_value || null, data.land_size_unit || "katha", data.plot_type || null, data.facing || null,
      data.handover_status || null, data.handover_date || null, data.furnishing_status || null, data.amenities_json || null, data.nearby_places_json || null,
      data.map_lat || null, data.map_lng || null, data.owner_note || null, data.admin_note || null, data.featured ? 1 : 0, now, now
    );

    const created = await stmt.first<DbListing>();
    if (!created) throw new Error("Failed to create property listing");
    return created;
  }

  async update(id: number, updates: Partial<DbListing>): Promise<DbListing | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedStatus = existing.status === "approved" ? "pending_review" : (updates.status || existing.status);

    const stmt = this.db.prepare(`
      UPDATE property_listings SET
        title = ?, description = ?, listing_purpose = ?, property_type = ?, property_subtype = ?,
        status = ?, price_amount = ?, price_label = ?, price_visibility = ?, currency = ?, price_period = ?,
        division = ?, district = ?, city = ?, area_name = ?, address_line = ?, display_address = ?,
        bedrooms = ?, bathrooms = ?, balconies = ?, parking_spaces = ?, floor_number = ?, total_floors = ?,
        size_value = ?, size_unit = ?, land_size_value = ?, land_size_unit = ?, plot_type = ?, facing = ?,
        handover_status = ?, handover_date = ?, furnishing_status = ?, amenities_json = ?, nearby_places_json = ?,
        map_lat = ?, map_lng = ?, owner_note = ?, admin_note = ?, featured = ?, updated_at = ?
      WHERE id = ? RETURNING *
    `).bind(
      updates.title ?? existing.title,
      updates.description ?? existing.description,
      updates.listing_purpose ?? existing.listing_purpose,
      updates.property_type ?? existing.property_type,
      updates.property_subtype ?? existing.property_subtype,
      updatedStatus,
      updates.price_amount ?? existing.price_amount,
      updates.price_label ?? existing.price_label,
      updates.price_visibility ?? existing.price_visibility,
      updates.currency ?? existing.currency,
      updates.price_period ?? existing.price_period,
      updates.division ?? existing.division,
      updates.district ?? existing.district,
      updates.city ?? existing.city,
      updates.area_name ?? existing.area_name,
      updates.address_line ?? existing.address_line,
      updates.display_address ?? existing.display_address,
      updates.bedrooms ?? existing.bedrooms,
      updates.bathrooms ?? existing.bathrooms,
      updates.balconies ?? existing.balconies,
      updates.parking_spaces ?? existing.parking_spaces,
      updates.floor_number ?? existing.floor_number,
      updates.total_floors ?? existing.total_floors,
      updates.size_value ?? existing.size_value,
      updates.size_unit ?? existing.size_unit,
      updates.land_size_value ?? existing.land_size_value,
      updates.land_size_unit ?? existing.land_size_unit,
      updates.plot_type ?? existing.plot_type,
      updates.facing ?? existing.facing,
      updates.handover_status ?? existing.handover_status,
      updates.handover_date ?? existing.handover_date,
      updates.furnishing_status ?? existing.furnishing_status,
      updates.amenities_json ?? existing.amenities_json,
      updates.nearby_places_json ?? existing.nearby_places_json,
      updates.map_lat ?? existing.map_lat,
      updates.map_lng ?? existing.map_lng,
      updates.owner_note ?? existing.owner_note,
      updates.admin_note ?? existing.admin_note,
      updates.featured !== undefined ? (updates.featured ? 1 : 0) : existing.featured,
      now,
      id
    );

    return await stmt.first<DbListing>();
  }

  async setLifecycleStatus(
    id: number,
    status: ListingStatus,
    adminUserId?: number,
    adminNote?: string
  ): Promise<DbListing | null> {
    const now = new Date().toISOString();
    let stmt: D1PreparedStatement;

    if (status === "approved") {
      stmt = this.db.prepare(`
        UPDATE property_listings SET
          status = 'approved',
          approved_by_user_id = ?,
          approved_at = ?,
          published_at = ?,
          admin_note = COALESCE(?, admin_note),
          updated_at = ?
        WHERE id = ? RETURNING *
      `).bind(adminUserId || null, now, now, adminNote || null, now, id);
    } else if (status === "rejected") {
      stmt = this.db.prepare(`
        UPDATE property_listings SET
          status = 'rejected',
          rejected_at = ?,
          admin_note = ?,
          updated_at = ?
        WHERE id = ? RETURNING *
      `).bind(now, adminNote || "", now, id);
    } else if (status === "unpublished") {
      stmt = this.db.prepare(`
        UPDATE property_listings SET
          status = 'unpublished',
          unpublished_at = ?,
          admin_note = COALESCE(?, admin_note),
          updated_at = ?
        WHERE id = ? RETURNING *
      `).bind(now, adminNote || null, now, id);
    } else {
      stmt = this.db.prepare(`
        UPDATE property_listings SET
          status = ?,
          admin_note = COALESCE(?, admin_note),
          updated_at = ?
        WHERE id = ? RETURNING *
      `).bind(status, adminNote || null, now, id);
    }

    return await stmt.first<DbListing>();
  }

  async deleteOrArchive(id: number): Promise<{ action: "deleted" | "archived" }> {
    const listing = await this.findById(id);
    if (!listing) throw new Error("Listing not found");

    if (listing.status === "draft") {
      await this.db.prepare("DELETE FROM property_listings WHERE id = ?").bind(id).run();
      return { action: "deleted" };
    } else {
      await this.setLifecycleStatus(id, "archived");
      return { action: "archived" };
    }
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .substring(0, 80);
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${base}-${suffix}`;
  }
}
