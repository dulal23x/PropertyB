/**
 * Users D1 Repository
 * Follows Chapter 16, 55 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbUser, UserRole } from "../../types/models";

export class UsersRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<DbUser | null> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?").bind(id);
    const result = await stmt.first<DbUser>();
    return result || null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const normalized = email.trim().toLowerCase();
    const stmt = this.db
      .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
      .bind(normalized);
    const result = await stmt.first<DbUser>();
    return result || null;
  }

  async create(user: {
    email: string;
    password_hash: string;
    role: UserRole;
    full_name?: string | null;
    is_active?: number;
  }): Promise<DbUser> {
    const normalizedEmail = user.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const stmt = this.db
      .prepare(
        `INSERT INTO users (email, password_hash, role, full_name, is_active, auth_version, password_reset_required, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
         RETURNING *`
      )
      .bind(
        normalizedEmail,
        user.password_hash,
        user.role,
        user.full_name || null,
        user.is_active ?? 1,
        now,
        now
      );

    const created = await stmt.first<DbUser>();
    if (!created) {
      throw new Error("Failed to create user record");
    }
    return created;
  }

  async updateProfile(id: number, full_name: string): Promise<DbUser | null> {
    const now = new Date().toISOString();
    const stmt = this.db
      .prepare("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ? RETURNING *")
      .bind(full_name, now, id);
    return await stmt.first<DbUser>();
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE users SET password_hash = ?, password_reset_required = 0, auth_version = auth_version + 1, updated_at = ? WHERE id = ?"
      )
      .bind(passwordHash, now, id)
      .run();
  }

  async updateAdminStatus(
    id: number,
    updates: { role?: UserRole; is_active?: number; full_name?: string }
  ): Promise<DbUser | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const role = updates.role ?? current.role;
    const is_active = updates.is_active ?? current.is_active;
    const full_name = updates.full_name ?? current.full_name;
    const now = new Date().toISOString();

    const stmt = this.db
      .prepare(
        `UPDATE users
         SET role = ?, is_active = ?, full_name = ?, auth_version = auth_version + 1, updated_at = ?
         WHERE id = ?
         RETURNING *`
      )
      .bind(role, is_active, full_name, now, id);

    return await stmt.first<DbUser>();
  }

  async listAll(limit = 50, offset = 0): Promise<{ items: DbUser[]; total: number }> {
    const countStmt = this.db.prepare("SELECT COUNT(*) as total FROM users");
    const countRes = await countStmt.first<{ total: number }>();
    const total = countRes?.total ?? 0;

    const listStmt = this.db
      .prepare("SELECT * FROM users ORDER BY id ASC LIMIT ? OFFSET ?")
      .bind(limit, offset);
    const { results } = await listStmt.all<DbUser>();

    return { items: results || [], total };
  }

  async countActiveAdmins(): Promise<number> {
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1"
    );
    const res = await stmt.first<{ count: number }>();
    return res?.count ?? 0;
  }
}
