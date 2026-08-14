"""
Script to generate baseline-system-inventory.json according to Chapter 03 of
PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md
"""

import hashlib
import json
import os
import sqlite3
import subprocess
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(BASE_DIR, "app", "backend", "realestate_mvp_v1.db")
OUTPUT_PATH = os.path.join(
    BASE_DIR, "real-estate-docs", "06-operations", "baseline-system-inventory.json"
)


def get_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def get_tool_versions():
    versions = {}
    try:
        versions["python"] = sys.version.split()[0]
    except Exception as e:
        versions["python"] = str(e)
    try:
        versions["node"] = subprocess.check_output(
            ["node", "-v"], text=True, shell=True
        ).strip()
    except Exception as e:
        versions["node"] = str(e)
    try:
        versions["npm"] = subprocess.check_output(
            ["npm", "-v"], text=True, shell=True
        ).strip()
    except Exception as e:
        versions["npm"] = str(e)
    try:
        versions["wrangler"] = subprocess.check_output(
            ["npx", "wrangler", "--version"], text=True, shell=True
        ).strip()
    except Exception as e:
        versions["wrangler"] = str(e)
    return versions


def get_database_inventory():
    if not os.path.exists(DB_PATH):
        return {"error": f"Database not found at {DB_PATH}"}

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    cur.execute("PRAGMA integrity_check;")
    integrity = cur.fetchall()

    cur.execute(
        "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view', 'index', 'trigger') ORDER BY type, name;"
    )
    objects = cur.fetchall()

    canonical_tables = [
        "users",
        "password_reset_tokens",
        "property_listings",
        "property_images",
        "property_inquiries",
        "property_audit_logs",
        "email_logs",
        "email_attachments",
        "email_templates",
        "security_events",
        "site_settings",
    ]

    excluded_tables = [
        "users_v2",
        "property_listings_v2",
        "property_images_v2",
        "property_inquiries_v2",
        "property_audit_logs_v2",
        "email_logs_v2",
        "password_reset_tokens_v2",
        "security_events_v2",
        "migration_state",
        "backfill_checkpoints",
    ]

    table_profiles = {}
    for table_name in canonical_tables + excluded_tables:
        try:
            cur.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cur.fetchone()[0]
            cur.execute(f"PRAGMA table_info({table_name})")
            columns = [
                {
                    "cid": row[0],
                    "name": row[1],
                    "type": row[2],
                    "notnull": bool(row[3]),
                    "default_value": row[4],
                    "pk": bool(row[5]),
                }
                for row in cur.fetchall()
            ]
            table_profiles[table_name] = {
                "row_count": count,
                "columns": columns,
                "is_canonical": table_name in canonical_tables,
            }
        except sqlite3.OperationalError as e:
            table_profiles[table_name] = {"error": str(e)}

    # Listing breakdown
    cur.execute(
        "SELECT status, COUNT(*) FROM property_listings GROUP BY status ORDER BY status"
    )
    listing_by_status = dict(cur.fetchall())

    cur.execute(
        "SELECT listing_purpose, COUNT(*) FROM property_listings GROUP BY listing_purpose ORDER BY listing_purpose"
    )
    listing_by_purpose = dict(cur.fetchall())

    cur.execute(
        "SELECT property_type, COUNT(*) FROM property_listings GROUP BY property_type ORDER BY property_type"
    )
    listing_by_type = dict(cur.fetchall())

    # User breakdown
    cur.execute("SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role")
    users_by_role = dict(cur.fetchall())

    con.close()

    return {
        "db_path": DB_PATH,
        "db_sha256": get_sha256(DB_PATH),
        "integrity_check": integrity[0][0] if integrity else "unknown",
        "canonical_tables": canonical_tables,
        "excluded_tables": excluded_tables,
        "table_profiles": table_profiles,
        "listing_breakdown": {
            "by_status": listing_by_status,
            "by_purpose": listing_by_purpose,
            "by_type": listing_by_type,
        },
        "users_breakdown": {"by_role": users_by_role},
    }


def get_openapi_spec():
    sys.path.insert(0, os.path.join(BASE_DIR, "app", "backend"))
    try:
        from app.main import app

        return app.openapi()
    except Exception as e:
        return {"error": str(e)}


def get_frontend_routes():
    frontend_app_dir = os.path.join(BASE_DIR, "nextjs-frontend", "src", "app")
    routes = []
    for root, dirs, files in os.walk(frontend_app_dir):
        for f in files:
            if f in ("page.tsx", "route.ts", "layout.tsx"):
                rel = os.path.relpath(os.path.join(root, f), frontend_app_dir)
                routes.append(rel.replace("\\", "/"))
    routes.sort()
    return routes


def main():
    print("Generating baseline system inventory...")
    inventory = {
        "generated_at": "2026-08-14T14:56:00Z",
        "workspace": BASE_DIR,
        "tools": get_tool_versions(),
        "database": get_database_inventory(),
        "frontend_routes": get_frontend_routes(),
        "backend_openapi": get_openapi_spec(),
        "environment_variables_contract": {
            "server_secrets": [
                "JWT_SECRET",
                "RESEND_API_KEY",
                "RESEND_WEBHOOK_SECRET",
            ],
            "server_bindings": [
                "DB",  # D1 Database binding
                "PROPERTY_IMAGES",  # R2 Bucket binding
            ],
            "public_variables": [
                "PUBLIC_APP_URL",
                "PUBLIC_API_URL",
                "PUBLIC_DEFAULT_CONTACT_PHONE",
                "PUBLIC_WHATSAPP_NUMBER",
            ],
        },
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)

    print(f"Inventory written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
