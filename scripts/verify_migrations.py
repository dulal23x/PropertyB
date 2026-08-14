"""
Verification test for D1 migrations.
Applies 0001, 0002, 0003 against a clean in-memory database with PRAGMA foreign_keys = ON.
"""

import glob
import os
import sqlite3

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MIGRATIONS_DIR = os.path.join(BASE_DIR, "tanstack-app", "migrations")


def test_migrations():
    print("Testing D1 migrations in clean in-memory SQLite database...")
    con = sqlite3.connect(":memory:")
    cur = con.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    migration_files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql")))
    print(f"Found {len(migration_files)} migration files:")
    for mf in migration_files:
        print(f" - Applying {os.path.basename(mf)}...")
        with open(mf, "r", encoding="utf-8") as f:
            cur.executescript(f.read())

    # Check foreign key integrity
    cur.execute("PRAGMA foreign_key_check;")
    fk_errors = cur.fetchall()
    if fk_errors:
        raise AssertionError(f"Foreign key violations found: {fk_errors}")
    print("PRAGMA foreign_key_check: PASS (0 errors)")

    # Check tables & counts
    cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    )
    tables = [r[0] for r in cur.fetchall()]

    counts = {}
    for t in tables:
        cur.execute(f"SELECT COUNT(*) FROM {t};")
        counts[t] = cur.fetchone()[0]

    print("\nTable Row Counts:")
    for t, c in counts.items():
        print(f"  {t}: {c}")

    expected = {
        "users": 8,
        "property_listings": 112,
        "property_images": 121,
        "email_templates": 10,
        "email_logs": 6,
        "password_reset_tokens": 0,
        "property_inquiries": 0,
        "property_audit_logs": 0,
        "email_attachments": 0,
        "security_events": 0,
        "site_settings": 0,
    }

    for t, exp in expected.items():
        assert (
            counts.get(t) == exp
        ), f"Table {t} count mismatch: expected {exp}, got {counts.get(t)}"

    print(
        "\nALL 11 CANONICAL TABLES AND REHEARSAL DATA VERIFIED WITH ZERO FOREIGN KEY VIOLATIONS!"
    )
    con.close()


if __name__ == "__main__":
    test_migrations()
