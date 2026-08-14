/**
 * Email Logs & Templates D1 Repository
 * Follows Chapters 24, 82, 84 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbEmailLog, DbEmailTemplate } from "../../types/models";

export class EmailRepository {
  constructor(private db: D1Database) {}

  async logSend(data: {
    to_email: string;
    subject: string;
    body: string;
    sender_type?: string;
    status?: string;
    provider?: string;
    provider_message_id?: string | null;
    idempotency_key?: string | null;
    error?: string | null;
    payload?: Record<string, unknown>;
  }): Promise<DbEmailLog> {
    const now = new Date().toISOString();
    const payloadJson = data.payload ? JSON.stringify(data.payload) : null;

    const stmt = this.db.prepare(`
      INSERT INTO email_logs (
        to_email, subject, body, sender_type, status, provider,
        provider_message_id, idempotency_key, attempt_count, error, payload_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.to_email.trim().toLowerCase(),
      data.subject,
      data.body,
      data.sender_type || "system",
      data.status || "sent",
      data.provider || "console",
      data.provider_message_id || null,
      data.idempotency_key || null,
      data.error || null,
      payloadJson,
      now,
      now
    );

    const created = await stmt.first<DbEmailLog>();
    if (!created) throw new Error("Failed to insert email log");
    return created;
  }

  async listLogs(limit = 50, offset = 0, status?: string): Promise<{ items: DbEmailLog[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM email_logs ${whereClause}`).bind(...params);
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    const listStmt = this.db.prepare(`
      SELECT * FROM email_logs
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset);

    const { results } = await listStmt.all<DbEmailLog>();
    return { items: results || [], total };
  }

  async getLogById(id: number): Promise<DbEmailLog | null> {
    const stmt = this.db.prepare("SELECT * FROM email_logs WHERE id = ?").bind(id);
    return (await stmt.first<DbEmailLog>()) || null;
  }

  async listTemplates(): Promise<DbEmailTemplate[]> {
    const stmt = this.db.prepare("SELECT * FROM email_templates ORDER BY id ASC");
    const { results } = await stmt.all<DbEmailTemplate>();
    return results || [];
  }

  async getTemplateByKey(templateKey: string): Promise<DbEmailTemplate | null> {
    const stmt = this.db.prepare("SELECT * FROM email_templates WHERE template_key = ?").bind(templateKey);
    return (await stmt.first<DbEmailTemplate>()) || null;
  }

  async updateTemplate(
    id: number,
    data: { subject?: string; body?: string; is_active?: number }
  ): Promise<DbEmailTemplate | null> {
    const now = new Date().toISOString();
    const existing = await this.db.prepare("SELECT * FROM email_templates WHERE id = ?").bind(id).first<DbEmailTemplate>();
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE email_templates SET
        subject = ?,
        body = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ?
      RETURNING *
    `).bind(
      data.subject ?? existing.subject,
      data.body ?? existing.body,
      data.is_active ?? existing.is_active,
      now,
      id
    );

    return await stmt.first<DbEmailTemplate>();
  }
}
