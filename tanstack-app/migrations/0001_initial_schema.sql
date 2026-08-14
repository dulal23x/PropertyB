-- Migration: 0001_initial_schema.sql
-- PropertyBikri Canonical D1 Database Schema
-- Follows Chapters 13-27 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md

PRAGMA foreign_keys = ON;

-- 1. Users Table (Chapter 16)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('client', 'admin')),
    full_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    auth_version INTEGER NOT NULL DEFAULT 1,
    password_reset_required INTEGER NOT NULL DEFAULT 0 CHECK(password_reset_required IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 2. Password Reset Tokens (Chapter 18)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL COLLATE NOCASE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    request_ip_hash TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 3. Property Listings (Chapters 19-20)
CREATE TABLE IF NOT EXISTS property_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    listing_purpose TEXT NOT NULL CHECK(listing_purpose IN ('sale', 'rent')),
    property_type TEXT NOT NULL CHECK(property_type IN ('apartment', 'house', 'land', 'commercial')),
    property_subtype TEXT,
    status TEXT NOT NULL CHECK(status IN ('draft', 'pending_review', 'approved', 'rejected', 'unpublished', 'archived')),
    price_amount REAL,
    price_label TEXT,
    price_visibility TEXT NOT NULL DEFAULT 'show_price' CHECK(price_visibility IN ('show_price', 'call_for_price', 'contact_for_price')),
    currency TEXT NOT NULL DEFAULT 'BDT',
    price_period TEXT CHECK(price_period IS NULL OR price_period IN ('monthly', 'yearly', 'total')),
    division TEXT,
    district TEXT,
    city TEXT NOT NULL,
    area_name TEXT NOT NULL,
    address_line TEXT,
    display_address TEXT NOT NULL,
    map_lat REAL,
    map_lng REAL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    balconies INTEGER,
    parking_spaces INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,
    size_value REAL,
    size_unit TEXT DEFAULT 'sqft',
    land_size_value REAL,
    land_size_unit TEXT DEFAULT 'katha',
    plot_type TEXT,
    facing TEXT,
    handover_status TEXT,
    handover_date TEXT,
    furnishing_status TEXT,
    amenities_json TEXT,
    nearby_places_json TEXT,
    owner_note TEXT,
    admin_note TEXT,
    featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0, 1)),
    approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TEXT,
    published_at TEXT,
    rejected_at TEXT,
    unpublished_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 4. Property Images (Chapter 21)
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_cover INTEGER NOT NULL DEFAULT 0 CHECK(is_cover IN (0, 1)),
    uploaded_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 5. Property Inquiries (Chapter 22)
CREATE TABLE IF NOT EXISTS property_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    preferred_contact_method TEXT NOT NULL DEFAULT 'phone' CHECK(preferred_contact_method IN ('phone', 'whatsapp', 'email')),
    source_page TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed', 'spam')),
    assigned_admin_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 6. Property Audit Logs (Chapter 23)
CREATE TABLE IF NOT EXISTS property_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    note TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 7. Email Logs (Chapter 24)
CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_type TEXT NOT NULL DEFAULT 'system',
    to_email TEXT NOT NULL COLLATE NOCASE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('queued', 'accepted', 'sent', 'delivered', 'bounced', 'complained', 'retrying', 'failed', 'suppressed')),
    provider TEXT NOT NULL DEFAULT 'console',
    provider_message_id TEXT,
    idempotency_key TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    error TEXT,
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 8. Email Attachments (Chapter 24)
CREATE TABLE IF NOT EXISTS email_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_log_id INTEGER NOT NULL REFERENCES email_logs(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    byte_size INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 9. Email Templates (Chapter 24, 84)
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    description TEXT,
    allowed_variables_json TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 10. Security Events (Chapter 25)
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    detail TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 11. Site Settings (Chapter 26)
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_public INTEGER NOT NULL DEFAULT 0 CHECK(is_public IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
