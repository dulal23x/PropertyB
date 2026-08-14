/**
 * Site Settings D1 Repository
 * Follows Chapters 26, 65, 81 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbSiteSetting } from "../../types/models";

export class SettingsRepository {
  constructor(private db: D1Database) {}

  async getSetting(key: string): Promise<string | null> {
    const stmt = this.db
      .prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?")
      .bind(key);
    const res = await stmt.first<{ setting_value: string }>();
    return res ? res.setting_value : null;
  }

  async listSettings(): Promise<DbSiteSetting[]> {
    const stmt = this.db.prepare("SELECT * FROM site_settings ORDER BY id ASC");
    const { results } = await stmt.all<DbSiteSetting>();
    return results || [];
  }

  async setSetting(
    key: string,
    value: string,
    description?: string,
    isPublic = 0
  ): Promise<DbSiteSetting> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, description, is_public, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        description = COALESCE(excluded.description, site_settings.description),
        is_public = excluded.is_public,
        updated_at = excluded.updated_at
      RETURNING *
    `).bind(key, value, description || null, isPublic, now, now);

    const saved = await stmt.first<DbSiteSetting>();
    if (!saved) throw new Error("Failed to set site setting");
    return saved;
  }

  async getGlobalContactNumber(envFallback = "+8801700000000"): Promise<string> {
    const dbValue = await this.getSetting("global_contact_number");
    if (dbValue && dbValue.trim().length > 0) {
      return dbValue.trim();
    }
    return envFallback;
  }
}
