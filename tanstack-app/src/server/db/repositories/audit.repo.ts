/**
 * Property Audit Logs D1 Repository
 * Follows Chapters 23, 55 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbAuditLog } from "../../types/models";

export class AuditRepository {
  constructor(private db: D1Database) {}

  async log(data: {
    listing_id: number;
    actor_user_id?: number | null;
    action: string;
    from_status?: string | null;
    to_status?: string | null;
    note?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<DbAuditLog> {
    const now = new Date().toISOString();
    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;

    const stmt = this.db.prepare(`
      INSERT INTO property_audit_logs (
        listing_id, actor_user_id, action, from_status, to_status, note, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.listing_id,
      data.actor_user_id || null,
      data.action,
      data.from_status || null,
      data.to_status || null,
      data.note || null,
      metadataJson,
      now
    );

    const created = await stmt.first<DbAuditLog>();
    if (!created) throw new Error("Failed to insert audit log");
    return created;
  }

  async findByListing(listingId: number): Promise<DbAuditLog[]> {
    const stmt = this.db
      .prepare(
        "SELECT * FROM property_audit_logs WHERE listing_id = ? ORDER BY created_at DESC, id DESC"
      )
      .bind(listingId);
    const { results } = await stmt.all<DbAuditLog>();
    return results || [];
  }

  async listRecent(limit = 20): Promise<DbAuditLog[]> {
    const stmt = this.db
      .prepare(
        "SELECT * FROM property_audit_logs ORDER BY created_at DESC, id DESC LIMIT ?"
      )
      .bind(limit);
    const { results } = await stmt.all<DbAuditLog>();
    return results || [];
  }
}
