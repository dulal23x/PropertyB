"""
Deterministic SQLite to Cloudflare D1 SQL & Data Manifest Converter
Follows Chapters 13-30 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
"""

import datetime
import hashlib
import json
import os
import re
import sqlite3

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SOURCE_DB_PATH = os.path.join(BASE_DIR, "app", "backend", "realestate_mvp_v1.db")
SQL_OUTPUT_PATH = os.path.join(
    BASE_DIR, "tanstack-app", "migrations", "0003_rehearsal_seed.sql"
)
MANIFEST_OUTPUT_PATH = os.path.join(
    BASE_DIR, "real-estate-docs", "06-operations", "rehearsal-data-manifest.json"
)


def get_sha256(filepath_or_bytes):
    h = hashlib.sha256()
    if isinstance(filepath_or_bytes, (bytes, bytearray)):
        h.update(filepath_or_bytes)
    else:
        with open(filepath_or_bytes, "rb") as f:
            while chunk := f.read(8192):
                h.update(chunk)
    return h.hexdigest()


def normalize_iso_utc(ts_str):
    if not ts_str:
        return None
    ts_str = str(ts_str).strip()
    if not ts_str:
        return None
    # Parse various SQLite formats e.g. "2026-06-08 11:43:00", "2026-06-08T11:43:00.123456"
    try:
        if "T" in ts_str:
            dt = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        else:
            dt = datetime.datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S.%f")
    except ValueError:
        try:
            dt = datetime.datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return ts_str  # return as-is if already valid format or custom
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    else:
        dt = dt.astimezone(datetime.timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def sql_escape_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return f"'{str(val).replace('\'', '\'\'')}'"


def validate_json_string(json_str):
    if not json_str:
        return None
    try:
        parsed = json.loads(json_str)
        return json.dumps(parsed, sort_keys=True)
    except Exception:
        return None


def export_database():
    print(f"Reading source database: {SOURCE_DB_PATH}")
    con = sqlite3.connect(f"file:{SOURCE_DB_PATH}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute("PRAGMA integrity_check;")
    integrity = cur.fetchone()[0]
    if integrity != "ok":
        raise RuntimeError(f"Source database integrity failed: {integrity}")

    sql_statements = [
        "-- 0003_rehearsal_seed.sql",
        "-- Deterministically generated from realestate_mvp_v1.db",
        "-- Follows Chapter 30 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md\n",
    ]

    manifest = {
        "source_db_path": SOURCE_DB_PATH,
        "source_db_sha256": get_sha256(SOURCE_DB_PATH),
        "generated_at": datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
        "tables": {},
    }

    # 1. Users
    cur.execute(
        "SELECT id, email, password_hash, role, full_name, is_active, created_at FROM users ORDER BY id ASC"
    )
    user_rows = cur.fetchall()
    user_records = []
    user_inserts = []

    for r in user_rows:
        email = r["email"].strip().lower()
        pwd_hash = r["password_hash"]
        is_pbkdf2 = pwd_hash.startswith("$pbkdf2-sha256$")
        password_reset_required = 0 if is_pbkdf2 else 1
        created_at = (
            normalize_iso_utc(r["created_at"]) or "2026-06-08T00:00:00Z"
        )
        updated_at = created_at

        user_records.append(
            {
                "id": r["id"],
                "email": email,
                "role": r["role"],
                "is_active": bool(r["is_active"]),
                "is_pbkdf2_compatible": is_pbkdf2,
                "password_reset_required": bool(password_reset_required),
            }
        )

        cols = [
            "id",
            "email",
            "password_hash",
            "role",
            "full_name",
            "is_active",
            "auth_version",
            "password_reset_required",
            "created_at",
            "updated_at",
        ]
        vals = [
            sql_escape_value(r["id"]),
            sql_escape_value(email),
            sql_escape_value(pwd_hash),
            sql_escape_value(r["role"]),
            sql_escape_value(r["full_name"]),
            sql_escape_value(1 if r["is_active"] else 0),
            "1",  # auth_version
            str(password_reset_required),
            sql_escape_value(created_at),
            sql_escape_value(updated_at),
        ]
        user_inserts.append(
            f"INSERT OR REPLACE INTO users ({', '.join(cols)}) VALUES ({', '.join(vals)});"
        )

    manifest["tables"]["users"] = {
        "count": len(user_rows),
        "compatible_passwords": sum(
            1 for u in user_records if u["is_pbkdf2_compatible"]
        ),
        "incompatible_passwords": sum(
            1 for u in user_records if not u["is_pbkdf2_compatible"]
        ),
        "records": user_records,
    }
    sql_statements.append(f"-- Users ({len(user_inserts)} rows)")
    sql_statements.extend(user_inserts)
    sql_statements.append("")

    # 2. Property Listings
    cur.execute("SELECT * FROM property_listings ORDER BY id ASC")
    listing_rows = cur.fetchall()
    listing_inserts = []
    listing_manifest_records = []

    listing_cols = [
        "id",
        "owner_user_id",
        "title",
        "slug",
        "description",
        "listing_purpose",
        "property_type",
        "property_subtype",
        "status",
        "price_amount",
        "price_label",
        "price_visibility",
        "currency",
        "price_period",
        "division",
        "district",
        "city",
        "area_name",
        "address_line",
        "display_address",
        "map_lat",
        "map_lng",
        "bedrooms",
        "bathrooms",
        "balconies",
        "parking_spaces",
        "floor_number",
        "total_floors",
        "size_value",
        "size_unit",
        "land_size_value",
        "land_size_unit",
        "plot_type",
        "facing",
        "handover_status",
        "handover_date",
        "furnishing_status",
        "amenities_json",
        "nearby_places_json",
        "owner_note",
        "admin_note",
        "featured",
        "approved_by_user_id",
        "approved_at",
        "published_at",
        "rejected_at",
        "unpublished_at",
        "created_at",
        "updated_at",
    ]

    for r in listing_rows:
        amenities = validate_json_string(r["amenities_json"])
        nearby = validate_json_string(r["nearby_places_json"])
        created_at = normalize_iso_utc(r["created_at"])
        updated_at = normalize_iso_utc(r["updated_at"]) or created_at
        approved_at = normalize_iso_utc(r["approved_at"])
        published_at = normalize_iso_utc(r["published_at"])
        rejected_at = normalize_iso_utc(r["rejected_at"])
        unpublished_at = normalize_iso_utc(r["unpublished_at"])

        vals = [
            sql_escape_value(r["id"]),
            sql_escape_value(r["owner_user_id"]),
            sql_escape_value(r["title"]),
            sql_escape_value(r["slug"]),
            sql_escape_value(r["description"]),
            sql_escape_value(r["listing_purpose"]),
            sql_escape_value(r["property_type"]),
            sql_escape_value(r["property_subtype"]),
            sql_escape_value(r["status"]),
            sql_escape_value(r["price_amount"]),
            sql_escape_value(r["price_label"]),
            sql_escape_value(r["price_visibility"]),
            sql_escape_value(r["currency"] or "BDT"),
            sql_escape_value(r["price_period"]),
            sql_escape_value(r["division"]),
            sql_escape_value(r["district"]),
            sql_escape_value(r["city"]),
            sql_escape_value(r["area_name"]),
            sql_escape_value(r["address_line"]),
            sql_escape_value(r["display_address"]),
            sql_escape_value(r["map_lat"]),
            sql_escape_value(r["map_lng"]),
            sql_escape_value(r["bedrooms"]),
            sql_escape_value(r["bathrooms"]),
            sql_escape_value(r["balconies"]),
            sql_escape_value(r["parking_spaces"]),
            sql_escape_value(r["floor_number"]),
            sql_escape_value(r["total_floors"]),
            sql_escape_value(r["size_value"]),
            sql_escape_value(r["size_unit"] or "sqft"),
            sql_escape_value(r["land_size_value"]),
            sql_escape_value(r["land_size_unit"] or "katha"),
            sql_escape_value(r["plot_type"]),
            sql_escape_value(r["facing"]),
            sql_escape_value(r["handover_status"]),
            sql_escape_value(r["handover_date"]),
            sql_escape_value(r["furnishing_status"]),
            sql_escape_value(amenities),
            sql_escape_value(nearby),
            sql_escape_value(r["owner_note"]),
            sql_escape_value(r["admin_note"]),
            sql_escape_value(1 if r["featured"] else 0),
            sql_escape_value(r["approved_by_user_id"]),
            sql_escape_value(approved_at),
            sql_escape_value(published_at),
            sql_escape_value(rejected_at),
            sql_escape_value(unpublished_at),
            sql_escape_value(created_at),
            sql_escape_value(updated_at),
        ]
        listing_inserts.append(
            f"INSERT OR REPLACE INTO property_listings ({', '.join(listing_cols)}) VALUES ({', '.join(vals)});"
        )
        listing_manifest_records.append(
            {
                "id": r["id"],
                "slug": r["slug"],
                "owner_user_id": r["owner_user_id"],
                "status": r["status"],
                "purpose": r["listing_purpose"],
                "type": r["property_type"],
            }
        )

    manifest["tables"]["property_listings"] = {
        "count": len(listing_rows),
        "records": listing_manifest_records,
    }
    sql_statements.append(
        f"-- Property Listings ({len(listing_inserts)} rows)"
    )
    sql_statements.extend(listing_inserts)
    sql_statements.append("")

    # 3. Property Images
    cur.execute("SELECT * FROM property_images ORDER BY id ASC")
    image_rows = cur.fetchall()
    image_inserts = []
    image_manifest_records = []
    image_cols = [
        "id",
        "listing_id",
        "storage_path",
        "public_url",
        "alt_text",
        "sort_order",
        "is_cover",
        "uploaded_by_user_id",
        "created_at",
    ]

    for r in image_rows:
        created_at = normalize_iso_utc(r["created_at"])
        vals = [
            sql_escape_value(r["id"]),
            sql_escape_value(r["listing_id"]),
            sql_escape_value(r["storage_path"]),
            sql_escape_value(r["public_url"]),
            sql_escape_value(r["alt_text"]),
            sql_escape_value(r["sort_order"]),
            sql_escape_value(1 if r["is_cover"] else 0),
            sql_escape_value(r["uploaded_by_user_id"]),
            sql_escape_value(created_at),
        ]
        image_inserts.append(
            f"INSERT OR REPLACE INTO property_images ({', '.join(image_cols)}) VALUES ({', '.join(vals)});"
        )
        image_manifest_records.append(
            {
                "id": r["id"],
                "listing_id": r["listing_id"],
                "storage_path": r["storage_path"],
                "public_url": r["public_url"],
                "is_cover": bool(r["is_cover"]),
            }
        )

    manifest["tables"]["property_images"] = {
        "count": len(image_rows),
        "records": image_manifest_records,
    }
    sql_statements.append(f"-- Property Images ({len(image_inserts)} rows)")
    sql_statements.extend(image_inserts)
    sql_statements.append("")

    # 4. Email Templates
    cur.execute("SELECT * FROM email_templates ORDER BY id ASC")
    template_rows = cur.fetchall()
    template_inserts = []
    template_cols = [
        "id",
        "template_key",
        "subject",
        "body",
        "description",
        "allowed_variables_json",
        "is_active",
        "created_at",
        "updated_at",
    ]

    for r in template_rows:
        updated_at = (
            normalize_iso_utc(r["updated_at"]) or "2026-06-08T00:00:00Z"
        )
        created_at = updated_at
        vals = [
            sql_escape_value(r["id"]),
            sql_escape_value(r["template_key"]),
            sql_escape_value(r["subject"]),
            sql_escape_value(r["body"]),
            sql_escape_value(None),  # description
            sql_escape_value(None),  # allowed_variables_json
            "1",  # is_active
            sql_escape_value(created_at),
            sql_escape_value(updated_at),
        ]
        template_inserts.append(
            f"INSERT OR REPLACE INTO email_templates ({', '.join(template_cols)}) VALUES ({', '.join(vals)});"
        )

    manifest["tables"]["email_templates"] = {
        "count": len(template_rows),
        "template_keys": [r["template_key"] for r in template_rows],
    }
    sql_statements.append(f"-- Email Templates ({len(template_inserts)} rows)")
    sql_statements.extend(template_inserts)
    sql_statements.append("")

    # 5. Email Logs
    cur.execute("SELECT * FROM email_logs ORDER BY id ASC")
    email_rows = cur.fetchall()
    email_inserts = []
    email_cols = [
        "id",
        "sender_type",
        "to_email",
        "subject",
        "body",
        "status",
        "provider",
        "error",
        "created_at",
        "updated_at",
    ]

    for r in email_rows:
        created_at = normalize_iso_utc(r["created_at"])
        updated_at = created_at
        vals = [
            sql_escape_value(r["id"]),
            sql_escape_value(r["sender_type"] or "system"),
            sql_escape_value(r["to_email"].strip().lower()),
            sql_escape_value(r["subject"]),
            sql_escape_value(r["body"]),
            sql_escape_value(r["status"] or "sent"),
            "'console'",
            sql_escape_value(r["error"]),
            sql_escape_value(created_at),
            sql_escape_value(updated_at),
        ]
        email_inserts.append(
            f"INSERT OR REPLACE INTO email_logs ({', '.join(email_cols)}) VALUES ({', '.join(vals)});"
        )

    manifest["tables"]["email_logs"] = {
        "count": len(email_rows),
    }
    sql_statements.append(f"-- Email Logs ({len(email_inserts)} rows)")
    sql_statements.extend(email_inserts)
    sql_statements.append("")

    con.close()

    full_sql = "\n".join(sql_statements)
    os.makedirs(os.path.dirname(SQL_OUTPUT_PATH), exist_ok=True)
    with open(SQL_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(full_sql)

    manifest["output_sql_path"] = SQL_OUTPUT_PATH
    manifest["output_sql_sha256"] = get_sha256(SQL_OUTPUT_PATH)
    manifest["total_statements"] = (
        len(user_inserts)
        + len(listing_inserts)
        + len(image_inserts)
        + len(template_inserts)
        + len(email_inserts)
    )

    os.makedirs(os.path.dirname(MANIFEST_OUTPUT_PATH), exist_ok=True)
    with open(MANIFEST_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(
        f"Export successful! SQL: {SQL_OUTPUT_PATH} (SHA-256: {manifest['output_sql_sha256']})"
    )
    print(
        f"Manifest written to: {MANIFEST_OUTPUT_PATH} with {manifest['total_statements']} total insert statements."
    )
    return manifest


if __name__ == "__main__":
    export_database()
