/**
 * Property Inquiries D1 Repository
 * Follows Chapters 22, 69, 77, 82 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbInquiry } from "../../types/models";

export interface InquiryWithListing extends DbInquiry {
  listing_title?: string;
  listing_slug?: string;
}

export class InquiriesRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<DbInquiry | null> {
    const stmt = this.db.prepare("SELECT * FROM property_inquiries WHERE id = ?").bind(id);
    return (await stmt.first<DbInquiry>()) || null;
  }

  async create(data: {
    listing_id: number;
    name: string;
    phone: string;
    email?: string | null;
    message?: string | null;
    preferred_contact_method?: "phone" | "whatsapp" | "email";
    source_page?: string | null;
    ip_hash?: string | null;
    user_agent?: string | null;
  }): Promise<DbInquiry> {
    const now = new Date().toISOString();
    const contactMethod = data.preferred_contact_method || "phone";

    const stmt = this.db.prepare(`
      INSERT INTO property_inquiries (
        listing_id, name, phone, email, message, preferred_contact_method,
        source_page, ip_hash, user_agent, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
      RETURNING *
    `).bind(
      data.listing_id,
      data.name,
      data.phone,
      data.email || null,
      data.message || null,
      contactMethod,
      data.source_page || null,
      data.ip_hash || null,
      data.user_agent || null,
      now,
      now
    );

    const created = await stmt.first<DbInquiry>();
    if (!created) throw new Error("Failed to insert inquiry");
    return created;
  }

  async findByOwner(
    ownerUserId: number,
    limit = 50,
    offset = 0
  ): Promise<{ items: InquiryWithListing[]; total: number }> {
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM property_inquiries pi
      JOIN property_listings pl ON pl.id = pi.listing_id
      WHERE pl.owner_user_id = ?
    `).bind(ownerUserId);
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    const listStmt = this.db.prepare(`
      SELECT 
        pi.id, pi.listing_id, pi.name, pi.phone, pi.email, pi.message,
        pi.preferred_contact_method, pi.status, pi.created_at, pi.updated_at,
        pl.title as listing_title, pl.slug as listing_slug
      FROM property_inquiries pi
      JOIN property_listings pl ON pl.id = pi.listing_id
      WHERE pl.owner_user_id = ?
      ORDER BY pi.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(ownerUserId, limit, offset);

    const { results } = await listStmt.all<InquiryWithListing>();
    return { items: results || [], total };
  }

  async listAdmin(
    status?: string,
    listingId?: number,
    limit = 50,
    offset = 0
  ): Promise<{ items: InquiryWithListing[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      conditions.push("pi.status = ?");
      params.push(status);
    }
    if (listingId) {
      conditions.push("pi.listing_id = ?");
      params.push(listingId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total
      FROM property_inquiries pi
      ${whereClause}
    `).bind(...params);
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    const listStmt = this.db.prepare(`
      SELECT 
        pi.*,
        pl.title as listing_title,
        pl.slug as listing_slug
      FROM property_inquiries pi
      LEFT JOIN property_listings pl ON pl.id = pi.listing_id
      ${whereClause}
      ORDER BY pi.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset);

    const { results } = await listStmt.all<InquiryWithListing>();
    return { items: results || [], total };
  }

  async updateStatus(
    id: number,
    status: "new" | "contacted" | "closed" | "spam",
    assignedAdminId?: number
  ): Promise<DbInquiry | null> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE property_inquiries
      SET status = ?, assigned_admin_user_id = COALESCE(?, assigned_admin_user_id), updated_at = ?
      WHERE id = ?
      RETURNING *
    `).bind(status, assignedAdminId || null, now, id);

    return await stmt.first<DbInquiry>();
  }
}
