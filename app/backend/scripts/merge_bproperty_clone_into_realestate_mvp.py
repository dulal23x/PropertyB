from __future__ import annotations

import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(r"C:\realestatesite")
BACKEND = ROOT / "app" / "backend"
SOURCE_DB = BACKEND / "bproperty_clone.db"
TARGET_DB = BACKEND / "realestate_mvp_v1.db"
BACKUP_DIR = ROOT / ".repo-archive"

USER_TABLES = ("users", "users_v2")
LISTING_TABLES = ("property_listings", "property_listings_v2")
IMAGE_TABLES = ("property_images", "property_images_v2")


def qident(name: str) -> str:
    return f'"{name}"'


def table_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    rows = conn.execute(f"PRAGMA table_info({qident(table)})").fetchall()
    return [row[1] for row in rows]


def row_dicts(conn: sqlite3.Connection, table: str) -> list[dict[str, object]]:
    columns = table_columns(conn, table)
    cursor = conn.execute(f"SELECT {', '.join(qident(c) for c in columns)} FROM {qident(table)} ORDER BY id")
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def fetch_one(conn: sqlite3.Connection, sql: str, params: tuple[object, ...]) -> sqlite3.Row | None:
    cur = conn.execute(sql, params)
    return cur.fetchone()


def ensure_row(
    target_conn: sqlite3.Connection,
    table: str,
    mirror_table: str | None,
    key_column: str,
    row: dict[str, object],
    explicit_id: int | None = None,
) -> int:
    key_value = row[key_column]
    existing = fetch_one(
        target_conn,
        f"SELECT id FROM {qident(table)} WHERE {qident(key_column)} = ?",
        (key_value,),
    )
    if existing is not None:
        row_id = int(existing["id"])
    else:
        columns = [c for c in row.keys() if c != "id"]
        values = [row[c] for c in columns]
        if explicit_id is None:
            target_conn.execute(
                f"INSERT INTO {qident(table)} ({qident('id')}, {', '.join(qident(c) for c in columns)}) VALUES (?, {', '.join('?' for _ in columns)})",
                [None, *values],
            )
        else:
            target_conn.execute(
                f"INSERT INTO {qident(table)} ({qident('id')}, {', '.join(qident(c) for c in columns)}) VALUES (?, {', '.join('?' for _ in columns)})",
                [explicit_id, *values],
            )
        row_id = int(target_conn.execute("SELECT last_insert_rowid()").fetchone()[0]) if explicit_id is None else int(explicit_id)

    if mirror_table:
        mirror_existing = fetch_one(
            target_conn,
            f"SELECT id FROM {qident(mirror_table)} WHERE {qident(key_column)} = ?",
            (key_value,),
        )
        if mirror_existing is None:
            columns = [c for c in row.keys() if c != "id"]
            values = [row[c] for c in columns]
            target_conn.execute(
                f"INSERT INTO {qident(mirror_table)} ({qident('id')}, {', '.join(qident(c) for c in columns)}) VALUES (?, {', '.join('?' for _ in columns)})",
                [row_id, *values],
            )
    return row_id


def main() -> int:
    if not SOURCE_DB.exists():
        print(f"Missing source DB: {SOURCE_DB}")
        return 1
    if not TARGET_DB.exists():
        print(f"Missing target DB: {TARGET_DB}")
        return 1

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / f"realestate_mvp_v1.premerge.{timestamp}.db"
    shutil.copy2(TARGET_DB, backup_path)
    print(f"Backup written to {backup_path}")

    source_conn = sqlite3.connect(SOURCE_DB)
    source_conn.row_factory = sqlite3.Row
    target_conn = sqlite3.connect(TARGET_DB)
    target_conn.row_factory = sqlite3.Row

    try:
        target_conn.execute("PRAGMA foreign_keys = ON")
        source_users = row_dicts(source_conn, "users")
        source_listings = row_dicts(source_conn, "property_listings")
        source_images = row_dicts(source_conn, "property_images")

        user_id_map: dict[int, int] = {}
        listing_id_map: dict[int, int] = {}

        target_conn.execute("BEGIN")

        for user in source_users:
            user_id_map[int(user["id"])] = ensure_row(
                target_conn,
                "users",
                "users_v2",
                "email",
                user,
                explicit_id=None,
            )

        for listing in source_listings:
            remapped = dict(listing)
            remapped["owner_user_id"] = user_id_map[int(listing["owner_user_id"])]
            approved_by = listing.get("approved_by_user_id")
            if approved_by is not None:
                remapped["approved_by_user_id"] = user_id_map.get(int(approved_by), int(approved_by))
            listing_id_map[int(listing["id"])] = ensure_row(
                target_conn,
                "property_listings",
                "property_listings_v2",
                "slug",
                remapped,
                explicit_id=None,
            )

        target_image_root = BACKEND / "userdata" / "property-images"
        for image in source_images:
            remapped = dict(image)
            remapped["listing_id"] = listing_id_map[int(image["listing_id"])]
            remapped["uploaded_by_user_id"] = user_id_map[int(image["uploaded_by_user_id"])]

            source_storage = Path(str(image["storage_path"]))
            source_file = BACKEND / source_storage
            new_listing_dir = target_image_root / str(remapped["listing_id"])
            new_listing_dir.mkdir(parents=True, exist_ok=True)
            new_file = new_listing_dir / source_file.name
            if source_file.exists():
                shutil.copy2(source_file, new_file)
            else:
                raise FileNotFoundError(f"Missing source image file: {source_file}")

            remapped["storage_path"] = str(Path("userdata") / "property-images" / str(remapped["listing_id"]) / source_file.name)
            remapped["public_url"] = f"http://localhost:8090/images/{remapped['listing_id']}/{source_file.name}"

            ensure_row(
                target_conn,
                "property_images",
                "property_images_v2",
                "storage_path",
                remapped,
                explicit_id=None,
            )

        target_conn.commit()
        print("Merge complete.")
        print(f"Users merged: {len(source_users)}")
        print(f"Listings merged: {len(source_listings)}")
        print(f"Images merged: {len(source_images)}")
        return 0
    except Exception as exc:
        target_conn.rollback()
        print(f"Merge failed: {exc}", file=sys.stderr)
        return 1
    finally:
        source_conn.close()
        target_conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
