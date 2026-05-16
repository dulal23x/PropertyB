# DATABASE_SCHEMA_PLAN

## Canonical MVP Database
`realestate_mvp_v1.db`

## Reused Tables
- `users`
- `password_reset_tokens`
- `email_logs`
- `email_attachments`
- `email_templates`
- `security_events`

## New Tables
- `property_listings`
- `property_images`
- `property_inquiries`
- `property_audit_logs`

## Deferred Tables
Do not depend on job/resume/subscription/team tables for MVP behavior.

## Required Indexes
- `property_listings.status`
- `property_listings.slug`
- `property_listings.city`
- `property_listings.area_name`
- `property_listings.listing_purpose`
- `property_listings.property_type`
- `property_listings.price_amount`
- `property_listings.created_at`
- `property_images.listing_id`
- `property_inquiries.listing_id`
- `property_inquiries.status`
- `property_inquiries.created_at`

## Migration Rule
Any schema change must update `05-contracts/SCHEMA_CONTRACTS.md`.

## V2 Scalability Layer (Implemented)
- Additive `*_v2` tables are now created at backend startup for dual-write and future PostgreSQL cutover.
- Current APIs still read from canonical MVP tables to avoid breaking behavior.
- SQLite triggers mirror writes from core tables to `*_v2` tables.
- Startup backfill syncs historical rows into `*_v2` tables with idempotent `INSERT OR IGNORE`.
- Drift visibility is available through admin migration status endpoint.

## V2 Readiness Targets
- 100k property rows and 10k client accounts supported by composite indexes on status/location/purpose/type and sorted listing scans.
- Inquiry and email log paths include query-shape indexes for high-volume admin dashboards.

## Legacy Cleanup Rule
- Legacy ClearlyHired/job/resume/team/billing table patterns must be discovered first.
- Drop is only allowed after verification that tables are unused by current backend.
- Current scan result: no legacy candidate tables found in the active DB.
