"""
Reconcile property images directly from archive and disk, building full R2 manifest.
Follows Chapters 36-40 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
"""

import hashlib
import io
import json
import mimetypes
import os
import re
import sqlite3
import tarfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "app", "backend", "realestate_mvp_v1.db")
TAR_PATH = os.path.join(
    BASE_DIR, "migration", "propertybikri-runtime-assets-20260810.tar.gz"
)
IMAGES_DIR = os.path.join(
    BASE_DIR, "app", "backend", "userdata", "property-images"
)
OUTPUT_MANIFEST_PATH = os.path.join(
    BASE_DIR, "real-estate-docs", "06-operations", "rehearsal-r2-manifest.json"
)


def sanitize_filename(filename):
    base = os.path.basename(filename)
    safe = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base)
    return safe


def reconcile_images():
    print(f"Opening database: {DB_PATH}")
    con = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute("SELECT id, slug, title FROM property_listings")
    listings_map = {r["id"]: dict(r) for r in cur.fetchall()}

    cur.execute(
        "SELECT id, listing_id, storage_path, public_url, alt_text, sort_order, is_cover FROM property_images ORDER BY listing_id, sort_order ASC, id ASC"
    )
    db_images = [dict(r) for r in cur.fetchall()]
    con.close()

    print(
        f"Database has {len(db_images)} image records across {len(listings_map)} listings."
    )

    # 1. Read files from archive and/or local filesystem
    source_files = {}

    if os.path.exists(TAR_PATH):
        print(f"Reading archive: {TAR_PATH}")
        with tarfile.open(TAR_PATH, "r:gz") as tf:
            for member in tf.getmembers():
                if not member.isfile():
                    continue
                f = tf.extractfile(member)
                if f is None:
                    continue
                content = f.read()
                h = hashlib.sha256(content).hexdigest()
                norm_path = (
                    member.name.replace("\\", "/")
                    .removeprefix("userdata/")
                    .removeprefix("property-images/")
                )
                # Store by normalized rel_path relative to property-images
                source_files[norm_path] = {
                    "rel_path": norm_path,
                    "tar_member_name": member.name,
                    "size_bytes": member.size,
                    "sha256": h,
                    "source": "archive",
                }

    if os.path.exists(IMAGES_DIR):
        for root, dirs, files in os.walk(IMAGES_DIR):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, IMAGES_DIR).replace(
                    "\\", "/"
                )
                if rel_path not in source_files:
                    h = hashlib.sha256(open(abs_path, "rb").read()).hexdigest()
                    source_files[rel_path] = {
                        "rel_path": rel_path,
                        "abs_path": abs_path,
                        "size_bytes": os.path.getsize(abs_path),
                        "sha256": h,
                        "source": "disk",
                    }

    print(f"Total source image files indexed: {len(source_files)}")

    # 2. Match DB image rows to physical assets
    matched_items = []
    missing_items = []

    for img in db_images:
        listing_id = img["listing_id"]
        storage_path = img["storage_path"].replace("\\", "/").strip("/")
        filename = os.path.basename(storage_path)

        # Candidates to match
        candidates = [
            f"{listing_id}/{filename}",
            storage_path,
            filename,
        ]

        matched_key = None
        for c in candidates:
            if c in source_files:
                matched_key = c
                break

        safe_name = sanitize_filename(filename)
        r2_key = f"property-images/{listing_id}/{safe_name}"
        mime_type, _ = mimetypes.guess_type(filename)
        mime_type = mime_type or "image/jpeg"

        if matched_key:
            src = source_files[matched_key]
            matched_items.append(
                {
                    "db_id": img["id"],
                    "listing_id": listing_id,
                    "storage_path": img["storage_path"],
                    "public_url": img["public_url"],
                    "is_cover": bool(img["is_cover"]),
                    "sort_order": img["sort_order"],
                    "r2_key": r2_key,
                    "mime_type": mime_type,
                    "size_bytes": src["size_bytes"],
                    "sha256": src["sha256"],
                    "source_archive_entry": src.get(
                        "tar_member_name", src.get("rel_path")
                    ),
                    "status": "matched_verified",
                }
            )
            source_files[matched_key]["claimed_by_db_id"] = img["id"]
        else:
            missing_items.append(
                {
                    "db_id": img["id"],
                    "listing_id": listing_id,
                    "storage_path": img["storage_path"],
                    "public_url": img["public_url"],
                    "r2_key": r2_key,
                    "status": "missing_from_source",
                }
            )

    # 3. Process unlinked physical files
    unlinked_attached = []
    quarantined = []

    for rel_path, src in source_files.items():
        if "claimed_by_db_id" in src:
            continue

        parts = rel_path.split("/")
        listing_id_cand = None
        if len(parts) >= 2 and parts[0].isdigit():
            listing_id_cand = int(parts[0])

        if listing_id_cand is not None and listing_id_cand in listings_map:
            safe_name = sanitize_filename(parts[-1])
            r2_key = f"property-images/{listing_id_cand}/{safe_name}"
            mime_type, _ = mimetypes.guess_type(parts[-1])
            unlinked_attached.append(
                {
                    "listing_id": listing_id_cand,
                    "rel_path": rel_path,
                    "r2_key": r2_key,
                    "mime_type": mime_type or "image/jpeg",
                    "size_bytes": src["size_bytes"],
                    "sha256": src["sha256"],
                    "disposition": "valid_listing_folder_extra",
                }
            )
        else:
            quarantined.append(
                {
                    "rel_path": rel_path,
                    "size_bytes": src["size_bytes"],
                    "sha256": src["sha256"],
                    "reason": "orphan_no_valid_listing_folder",
                    "quarantine_key": f"quarantine/{sanitize_filename(rel_path)}",
                }
            )

    total_source_check = (
        len(matched_items) + len(unlinked_attached) + len(quarantined)
    )

    manifest = {
        "generated_at": "2026-08-14T14:58:00Z",
        "total_source_files": len(source_files),
        "total_db_image_rows": len(db_images),
        "matched_verified_count": len(matched_items),
        "missing_from_source_count": len(missing_items),
        "unlinked_attached_count": len(unlinked_attached),
        "quarantine_count": len(quarantined),
        "checksum_check": {
            "sum_matched_unlinked_quarantine": total_source_check,
            "equals_total_source": total_source_check == len(source_files),
        },
        "matched_items": matched_items,
        "missing_items": missing_items,
        "unlinked_attached_items": unlinked_attached,
        "quarantine_items": quarantined,
    }

    os.makedirs(os.path.dirname(OUTPUT_MANIFEST_PATH), exist_ok=True)
    with open(OUTPUT_MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print("\n--- Image Reconciliation Summary ---")
    print(f"Total source physical files in archive/disk: {len(source_files)}")
    print(
        f"Database image rows matched & verified: {len(matched_items)} / {len(db_images)}"
    )
    print(f"Missing from archive: {len(missing_items)}")
    print(
        f"Unlinked extra images in valid listing folders: {len(unlinked_attached)}"
    )
    print(f"Quarantined orphan files: {len(quarantined)}")
    print(
        f"Gate Check: {total_source_check} == {len(source_files)} -> {total_source_check == len(source_files)}"
    )
    print(f"Manifest written to: {OUTPUT_MANIFEST_PATH}")
    return manifest


if __name__ == "__main__":
    reconcile_images()
