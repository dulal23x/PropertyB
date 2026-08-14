-- Migration: 0002_indexes.sql
-- PropertyBikri Performance and Covering Indexes
-- Follows Chapter 28 of PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md

-- Users Indexes
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);

-- Password Reset Tokens Indexes
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_email ON password_reset_tokens(email);

-- Listings Search & Filter Indexes
CREATE INDEX IF NOT EXISTS ix_property_listings_slug ON property_listings(slug);
CREATE INDEX IF NOT EXISTS ix_property_listings_owner_updated ON property_listings(owner_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_property_listings_status_created ON property_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_property_listings_status_purpose_type ON property_listings(status, listing_purpose, property_type);
CREATE INDEX IF NOT EXISTS ix_property_listings_status_city_area ON property_listings(status, city, area_name);
CREATE INDEX IF NOT EXISTS ix_property_listings_featured_status ON property_listings(featured, status, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_property_listings_price ON property_listings(price_amount);
CREATE INDEX IF NOT EXISTS ix_property_listings_size ON property_listings(size_value);
CREATE INDEX IF NOT EXISTS ix_property_listings_land_size ON property_listings(land_size_value);

-- Images Indexes
CREATE INDEX IF NOT EXISTS ix_property_images_listing_cover_sort ON property_images(listing_id, is_cover DESC, sort_order ASC);
CREATE INDEX IF NOT EXISTS ix_property_images_listing_id ON property_images(listing_id);

-- Inquiries Indexes
CREATE INDEX IF NOT EXISTS ix_property_inquiries_status_updated ON property_inquiries(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_property_inquiries_listing_created ON property_inquiries(listing_id, created_at DESC);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS ix_property_audit_logs_listing_created ON property_audit_logs(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_property_audit_logs_actor_created ON property_audit_logs(actor_user_id, created_at DESC);

-- Email Logs Indexes
CREATE INDEX IF NOT EXISTS ix_email_logs_to_created ON email_logs(to_email, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_email_logs_provider_msg_id ON email_logs(provider_message_id);
CREATE INDEX IF NOT EXISTS ix_email_logs_idempotency ON email_logs(idempotency_key);

-- Security Events Indexes
CREATE INDEX IF NOT EXISTS ix_security_events_type_created ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_security_events_user_created ON security_events(user_id, created_at DESC);

-- Site Settings Index
CREATE INDEX IF NOT EXISTS ix_site_settings_key ON site_settings(setting_key);
