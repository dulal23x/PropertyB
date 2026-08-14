/**
 * Property Images D1 Repository
 * Follows Chapters 21, 41-43, 76 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
 */

import type { DbImage } from "../../types/models";

export class ImagesRepository {
  constructor(private db: D1Database) {}

  async findById(id: number): Promise<DbImage | null> {
    const stmt = this.db.prepare("SELECT * FROM property_images WHERE id = ?").bind(id);
    return (await stmt.first<DbImage>()) || null;
  }

  async findByListing(listingId: number): Promise<DbImage[]> {
    const stmt = this.db
      .prepare(
        "SELECT * FROM property_images WHERE listing_id = ? ORDER BY is_cover DESC, sort_order ASC, id ASC"
      )
      .bind(listingId);
    const { results } = await stmt.all<DbImage>();
    return results || [];
  }

  async create(data: {
    listing_id: number;
    storage_path: string;
    public_url: string;
    alt_text?: string | null;
    sort_order?: number;
    is_cover?: number;
    uploaded_by_user_id?: number | null;
  }): Promise<DbImage> {
    const now = new Date().toISOString();
    const sortOrder = data.sort_order ?? 0;
    const isCover = data.is_cover ?? 0;

    if (isCover === 1) {
      // Demote existing covers for this listing
      await this.db
        .prepare("UPDATE property_images SET is_cover = 0 WHERE listing_id = ?")
        .bind(data.listing_id)
        .run();
    }

    const stmt = this.db
      .prepare(
        `INSERT INTO property_images (listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(
        data.listing_id,
        data.storage_path,
        data.public_url,
        data.alt_text || null,
        sortOrder,
        isCover,
        data.uploaded_by_user_id || null,
        now
      );

    const created = await stmt.first<DbImage>();
    if (!created) throw new Error("Failed to insert image record");
    return created;
  }

  async delete(id: number): Promise<{ deletedImage: DbImage; newCoverId: number | null }> {
    const img = await this.findById(id);
    if (!img) throw new Error("Image not found");

    await this.db.prepare("DELETE FROM property_images WHERE id = ?").bind(id).run();

    let newCoverId: number | null = null;
    if (img.is_cover === 1) {
      // Pick next image as cover deterministically
      const nextImg = await this.db
        .prepare(
          "SELECT id FROM property_images WHERE listing_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1"
        )
        .bind(img.listing_id)
        .first<{ id: number }>();

      if (nextImg) {
        await this.db
          .prepare("UPDATE property_images SET is_cover = 1 WHERE id = ?")
          .bind(nextImg.id)
          .run();
        newCoverId = nextImg.id;
      }
    }

    return { deletedImage: img, newCoverId };
  }
}
