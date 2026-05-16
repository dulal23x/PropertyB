from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


LISTING_ADDITIONAL_COLUMNS = {
    "price_label": "TEXT",
    "price_visibility": "TEXT DEFAULT 'show_price'",
    "price_period": "TEXT",
    "balconies": "INTEGER",
    "parking_spaces": "INTEGER",
    "floor_number": "INTEGER",
    "total_floors": "INTEGER",
    "land_size_value": "FLOAT",
    "land_size_unit": "TEXT",
    "plot_type": "TEXT",
    "facing": "TEXT",
    "handover_status": "TEXT",
    "handover_date": "TEXT",
    "furnishing_status": "TEXT",
    "amenities_json": "TEXT",
    "nearby_places_json": "TEXT",
    "map_lat": "FLOAT",
    "map_lng": "FLOAT",
}


def _uuid_sql() -> str:
    # SQLite-friendly pseudo-UUID (good enough for public_id uniqueness).
    return "(lower(hex(randomblob(4)))||'-'||lower(hex(randomblob(2)))||'-'||lower(hex(randomblob(2)))||'-'||lower(hex(randomblob(2)))||'-'||lower(hex(randomblob(6))))"


V2_DDL = [
    f"""
    CREATE TABLE IF NOT EXISTS users_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('client','admin')),
        full_name TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS property_listings_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        owner_user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        listing_purpose TEXT NOT NULL CHECK(listing_purpose IN ('sale','rent')),
        property_type TEXT NOT NULL,
        property_subtype TEXT,
        status TEXT NOT NULL CHECK(status IN ('draft','pending_review','approved','rejected','unpublished','archived')),
        price_amount NUMERIC,
        price_label TEXT,
        price_visibility TEXT NOT NULL DEFAULT 'show_price' CHECK(price_visibility IN ('show_price','call_for_price')),
        currency TEXT NOT NULL DEFAULT 'BDT',
        price_period TEXT,
        division TEXT,
        district TEXT,
        city TEXT,
        area_name TEXT,
        address_line TEXT,
        display_address TEXT,
        map_lat FLOAT,
        map_lng FLOAT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        balconies INTEGER,
        parking_spaces INTEGER,
        floor_number INTEGER,
        total_floors INTEGER,
        size_value FLOAT,
        size_unit TEXT,
        land_size_value FLOAT,
        land_size_unit TEXT,
        plot_type TEXT,
        facing TEXT,
        handover_status TEXT,
        handover_date TEXT,
        furnishing_status TEXT,
        amenities_json TEXT,
        nearby_places_json TEXT,
        owner_note TEXT,
        admin_note TEXT,
        featured INTEGER NOT NULL DEFAULT 0,
        approved_by_user_id INTEGER,
        approved_at TEXT,
        published_at TEXT,
        rejected_at TEXT,
        unpublished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS property_images_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        listing_id INTEGER NOT NULL,
        storage_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        alt_text TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_cover INTEGER NOT NULL DEFAULT 0,
        uploaded_by_user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS property_inquiries_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        listing_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        message TEXT,
        preferred_contact_method TEXT,
        source_page TEXT,
        ip_hash TEXT,
        user_agent TEXT,
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','closed','spam')),
        assigned_admin_user_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS property_audit_logs_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        listing_id INTEGER NOT NULL,
        actor_user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT,
        note TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS email_logs_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        sender_type TEXT NOT NULL,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        error TEXT,
        created_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS password_reset_tokens_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS security_events_v2 (
        id INTEGER PRIMARY KEY,
        public_id TEXT UNIQUE NOT NULL DEFAULT {_uuid_sql()},
        event_type TEXT NOT NULL,
        ip TEXT,
        detail TEXT,
        created_at TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS migration_state (
        id INTEGER PRIMARY KEY,
        phase TEXT NOT NULL,
        detail TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS backfill_checkpoints (
        table_name TEXT PRIMARY KEY,
        last_synced_id INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """,
]


V2_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_pl2_status_created ON property_listings_v2(status, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_pl2_status_city_area ON property_listings_v2(status, city, area_name)",
    "CREATE INDEX IF NOT EXISTS idx_pl2_status_purpose_type ON property_listings_v2(status, listing_purpose, property_type)",
    "CREATE INDEX IF NOT EXISTS idx_pl2_price ON property_listings_v2(price_amount)",
    "CREATE INDEX IF NOT EXISTS idx_pl2_size ON property_listings_v2(size_value)",
    "CREATE INDEX IF NOT EXISTS idx_pl2_land_size ON property_listings_v2(land_size_value)",
    "CREATE INDEX IF NOT EXISTS idx_pi2_listing_cover_sort ON property_images_v2(listing_id, is_cover DESC, sort_order ASC)",
    "CREATE INDEX IF NOT EXISTS idx_inq2_status_updated ON property_inquiries_v2(status, updated_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_inq2_listing_created ON property_inquiries_v2(listing_id, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_el2_to_created ON email_logs_v2(to_email, created_at DESC)",
]


TRIGGERS = [
    """
    CREATE TRIGGER IF NOT EXISTS trg_users_ai AFTER INSERT ON users
    BEGIN
        INSERT OR REPLACE INTO users_v2(id, email, password_hash, role, full_name, is_active, created_at)
        VALUES (NEW.id, lower(NEW.email), NEW.password_hash, CASE WHEN NEW.role='admin' THEN 'admin' ELSE 'client' END, NEW.full_name, NEW.is_active, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_users_au AFTER UPDATE ON users
    BEGIN
        INSERT OR REPLACE INTO users_v2(id, email, password_hash, role, full_name, is_active, created_at)
        VALUES (NEW.id, lower(NEW.email), NEW.password_hash, CASE WHEN NEW.role='admin' THEN 'admin' ELSE 'client' END, NEW.full_name, NEW.is_active, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_pl_ai AFTER INSERT ON property_listings
    BEGIN
        INSERT OR REPLACE INTO property_listings_v2(
            id, owner_user_id, title, slug, description, listing_purpose, property_type, property_subtype, status, price_amount, price_label, price_visibility, currency, price_period,
            division, district, city, area_name, address_line, display_address, map_lat, map_lng, bedrooms, bathrooms, balconies, parking_spaces, floor_number, total_floors,
            size_value, size_unit, land_size_value, land_size_unit, plot_type, facing, handover_status, handover_date, furnishing_status, amenities_json, nearby_places_json,
            owner_note, admin_note, featured, approved_by_user_id, approved_at, published_at, rejected_at, unpublished_at, created_at, updated_at
        ) VALUES (
            NEW.id, NEW.owner_user_id, NEW.title, NEW.slug, NEW.description, NEW.listing_purpose, NEW.property_type, NEW.property_subtype, NEW.status, NEW.price_amount, NEW.price_label, NEW.price_visibility, NEW.currency, NEW.price_period,
            NEW.division, NEW.district, NEW.city, NEW.area_name, NEW.address_line, NEW.display_address, NEW.map_lat, NEW.map_lng, NEW.bedrooms, NEW.bathrooms, NEW.balconies, NEW.parking_spaces, NEW.floor_number, NEW.total_floors,
            NEW.size_value, NEW.size_unit, NEW.land_size_value, NEW.land_size_unit, NEW.plot_type, NEW.facing, NEW.handover_status, NEW.handover_date, NEW.furnishing_status, NEW.amenities_json, NEW.nearby_places_json,
            NEW.owner_note, NEW.admin_note, NEW.featured, NEW.approved_by_user_id, NEW.approved_at, NEW.published_at, NEW.rejected_at, NEW.unpublished_at, NEW.created_at, NEW.updated_at
        );
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_pl_au AFTER UPDATE ON property_listings
    BEGIN
        INSERT OR REPLACE INTO property_listings_v2(
            id, owner_user_id, title, slug, description, listing_purpose, property_type, property_subtype, status, price_amount, price_label, price_visibility, currency, price_period,
            division, district, city, area_name, address_line, display_address, map_lat, map_lng, bedrooms, bathrooms, balconies, parking_spaces, floor_number, total_floors,
            size_value, size_unit, land_size_value, land_size_unit, plot_type, facing, handover_status, handover_date, furnishing_status, amenities_json, nearby_places_json,
            owner_note, admin_note, featured, approved_by_user_id, approved_at, published_at, rejected_at, unpublished_at, created_at, updated_at
        ) VALUES (
            NEW.id, NEW.owner_user_id, NEW.title, NEW.slug, NEW.description, NEW.listing_purpose, NEW.property_type, NEW.property_subtype, NEW.status, NEW.price_amount, NEW.price_label, NEW.price_visibility, NEW.currency, NEW.price_period,
            NEW.division, NEW.district, NEW.city, NEW.area_name, NEW.address_line, NEW.display_address, NEW.map_lat, NEW.map_lng, NEW.bedrooms, NEW.bathrooms, NEW.balconies, NEW.parking_spaces, NEW.floor_number, NEW.total_floors,
            NEW.size_value, NEW.size_unit, NEW.land_size_value, NEW.land_size_unit, NEW.plot_type, NEW.facing, NEW.handover_status, NEW.handover_date, NEW.furnishing_status, NEW.amenities_json, NEW.nearby_places_json,
            NEW.owner_note, NEW.admin_note, NEW.featured, NEW.approved_by_user_id, NEW.approved_at, NEW.published_at, NEW.rejected_at, NEW.unpublished_at, NEW.created_at, NEW.updated_at
        );
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_pi_ai AFTER INSERT ON property_images
    BEGIN
        INSERT OR REPLACE INTO property_images_v2(id, listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at)
        VALUES (NEW.id, NEW.listing_id, NEW.storage_path, NEW.public_url, NEW.alt_text, NEW.sort_order, NEW.is_cover, NEW.uploaded_by_user_id, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_pi_au AFTER UPDATE ON property_images
    BEGIN
        INSERT OR REPLACE INTO property_images_v2(id, listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at)
        VALUES (NEW.id, NEW.listing_id, NEW.storage_path, NEW.public_url, NEW.alt_text, NEW.sort_order, NEW.is_cover, NEW.uploaded_by_user_id, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_inq_ai AFTER INSERT ON property_inquiries
    BEGIN
        INSERT OR REPLACE INTO property_inquiries_v2(id, listing_id, name, phone, email, message, preferred_contact_method, source_page, ip_hash, user_agent, status, assigned_admin_user_id, created_at, updated_at)
        VALUES (NEW.id, NEW.listing_id, NEW.name, NEW.phone, NEW.email, NEW.message, NEW.preferred_contact_method, NEW.source_page, NEW.ip_hash, NEW.user_agent, NEW.status, NEW.assigned_admin_user_id, NEW.created_at, NEW.updated_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_inq_au AFTER UPDATE ON property_inquiries
    BEGIN
        INSERT OR REPLACE INTO property_inquiries_v2(id, listing_id, name, phone, email, message, preferred_contact_method, source_page, ip_hash, user_agent, status, assigned_admin_user_id, created_at, updated_at)
        VALUES (NEW.id, NEW.listing_id, NEW.name, NEW.phone, NEW.email, NEW.message, NEW.preferred_contact_method, NEW.source_page, NEW.ip_hash, NEW.user_agent, NEW.status, NEW.assigned_admin_user_id, NEW.created_at, NEW.updated_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_audit_ai AFTER INSERT ON property_audit_logs
    BEGIN
        INSERT OR REPLACE INTO property_audit_logs_v2(id, listing_id, actor_user_id, action, from_status, to_status, note, metadata_json, created_at)
        VALUES (NEW.id, NEW.listing_id, NEW.actor_user_id, NEW.action, NEW.from_status, NEW.to_status, NEW.note, NEW.metadata_json, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_email_ai AFTER INSERT ON email_logs
    BEGIN
        INSERT OR REPLACE INTO email_logs_v2(id, sender_type, to_email, subject, body, status, error, created_at)
        VALUES (NEW.id, NEW.sender_type, NEW.to_email, NEW.subject, NEW.body, NEW.status, NEW.error, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_prt_ai AFTER INSERT ON password_reset_tokens
    BEGIN
        INSERT OR REPLACE INTO password_reset_tokens_v2(id, email, token, expires_at, used, created_at)
        VALUES (NEW.id, NEW.email, NEW.token, NEW.expires_at, NEW.used, NEW.created_at);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_sec_ai AFTER INSERT ON security_events
    BEGIN
        INSERT OR REPLACE INTO security_events_v2(id, event_type, ip, detail, created_at)
        VALUES (NEW.id, NEW.event_type, NEW.ip, NEW.detail, NEW.created_at);
    END;
    """,
]


BACKFILL_SQL = [
    "INSERT OR IGNORE INTO users_v2(id, email, password_hash, role, full_name, is_active, created_at) SELECT id, lower(email), password_hash, CASE WHEN role='admin' THEN 'admin' ELSE 'client' END, full_name, is_active, created_at FROM users",
    """
    INSERT OR IGNORE INTO property_listings_v2(
        id, owner_user_id, title, slug, description, listing_purpose, property_type, property_subtype, status, price_amount, price_label, price_visibility, currency, price_period,
        division, district, city, area_name, address_line, display_address, map_lat, map_lng, bedrooms, bathrooms, balconies, parking_spaces, floor_number, total_floors,
        size_value, size_unit, land_size_value, land_size_unit, plot_type, facing, handover_status, handover_date, furnishing_status, amenities_json, nearby_places_json,
        owner_note, admin_note, featured, approved_by_user_id, approved_at, published_at, rejected_at, unpublished_at, created_at, updated_at
    )
    SELECT
        id, owner_user_id, title, slug, description, listing_purpose, property_type, property_subtype, status, price_amount, price_label, price_visibility, currency, price_period,
        division, district, city, area_name, address_line, display_address, map_lat, map_lng, bedrooms, bathrooms, balconies, parking_spaces, floor_number, total_floors,
        size_value, size_unit, land_size_value, land_size_unit, plot_type, facing, handover_status, handover_date, furnishing_status, amenities_json, nearby_places_json,
        owner_note, admin_note, featured, approved_by_user_id, approved_at, published_at, rejected_at, unpublished_at, created_at, updated_at
    FROM property_listings
    """,
    "INSERT OR IGNORE INTO property_images_v2(id, listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at) SELECT id, listing_id, storage_path, public_url, alt_text, sort_order, is_cover, uploaded_by_user_id, created_at FROM property_images",
    "INSERT OR IGNORE INTO property_inquiries_v2(id, listing_id, name, phone, email, message, preferred_contact_method, source_page, ip_hash, user_agent, status, assigned_admin_user_id, created_at, updated_at) SELECT id, listing_id, name, phone, email, message, preferred_contact_method, source_page, ip_hash, user_agent, status, assigned_admin_user_id, created_at, updated_at FROM property_inquiries",
    "INSERT OR IGNORE INTO property_audit_logs_v2(id, listing_id, actor_user_id, action, from_status, to_status, note, metadata_json, created_at) SELECT id, listing_id, actor_user_id, action, from_status, to_status, note, metadata_json, created_at FROM property_audit_logs",
    "INSERT OR IGNORE INTO email_logs_v2(id, sender_type, to_email, subject, body, status, error, created_at) SELECT id, sender_type, to_email, subject, body, status, error, created_at FROM email_logs",
    "INSERT OR IGNORE INTO password_reset_tokens_v2(id, email, token, expires_at, used, created_at) SELECT id, email, token, expires_at, used, created_at FROM password_reset_tokens",
    "INSERT OR IGNORE INTO security_events_v2(id, event_type, ip, detail, created_at) SELECT id, event_type, ip, detail, created_at FROM security_events",
]


async def _table_columns(conn, table_name: str) -> set[str]:
    rows = await conn.execute(text(f"PRAGMA table_info({table_name})"))
    return {str(row[1]) for row in rows.fetchall()}


async def ensure_runtime_schema(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        listing_cols = await _table_columns(conn, "property_listings")
        for col, sql_type in LISTING_ADDITIONAL_COLUMNS.items():
            if col not in listing_cols:
                await conn.execute(text(f"ALTER TABLE property_listings ADD COLUMN {col} {sql_type}"))
        for ddl in V2_DDL:
            await conn.execute(text(ddl))
        for idx in V2_INDEXES:
            await conn.execute(text(idx))
        for trg in TRIGGERS:
            await conn.execute(text(trg))
        for sql in BACKFILL_SQL:
            await conn.execute(text(sql))
        await conn.execute(text("DELETE FROM migration_state WHERE phase = 'dual_write_active'"))
        await conn.execute(
            text(
                "INSERT INTO migration_state(id, phase, detail, updated_at) VALUES (1, 'dual_write_active', 'v2 tables and triggers active', CURRENT_TIMESTAMP)"
            )
        )


async def get_v2_drift_counts(engine: AsyncEngine) -> dict:
    checks = {
        "users": ("users", "users_v2"),
        "property_listings": ("property_listings", "property_listings_v2"),
        "property_images": ("property_images", "property_images_v2"),
        "property_inquiries": ("property_inquiries", "property_inquiries_v2"),
        "property_audit_logs": ("property_audit_logs", "property_audit_logs_v2"),
        "email_logs": ("email_logs", "email_logs_v2"),
        "password_reset_tokens": ("password_reset_tokens", "password_reset_tokens_v2"),
        "security_events": ("security_events", "security_events_v2"),
    }
    out: dict[str, dict] = {}
    async with engine.begin() as conn:
        for key, (old_t, new_t) in checks.items():
            old_cnt = (await conn.execute(text(f"SELECT COUNT(*) FROM {old_t}"))).scalar_one()
            new_cnt = (await conn.execute(text(f"SELECT COUNT(*) FROM {new_t}"))).scalar_one()
            out[key] = {"old": old_cnt, "v2": new_cnt, "delta": new_cnt - old_cnt}
    return out


async def find_legacy_candidate_tables(engine: AsyncEngine) -> list[str]:
    patterns = ["%job%", "%resume%", "%application%", "%team_%", "%stripe%", "%billing%", "%clearlyhired%"]
    async with engine.begin() as conn:
        names = []
        for p in patterns:
            rows = await conn.execute(
                text(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND lower(name) LIKE :p ORDER BY name"
                ),
                {"p": p},
            )
            names.extend([r[0] for r in rows.fetchall()])
        seen = set()
        ordered = []
        for n in names:
            if n not in seen:
                seen.add(n)
                ordered.append(n)
        return ordered
