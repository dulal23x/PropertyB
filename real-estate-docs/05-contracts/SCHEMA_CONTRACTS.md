# SCHEMA_CONTRACTS

## Canonical DB
`realestate_mvp_v1.db`

## Tables
- `users`
- `password_reset_tokens`
- `property_listings`
- `property_images`
- `property_inquiries`
- `property_audit_logs`
- `email_logs`
- `email_attachments`
- `email_templates`
- `security_events`

## `property_listings`
- `id`
- `owner_user_id`
- `title`
- `slug`
- `description`
- `listing_purpose`
- `property_type`
- `property_subtype`
- `status`
- `price_amount`
- `price_label`
- `price_visibility`
- `currency`
- `price_period`
- `division`
- `district`
- `city`
- `area_name`
- `address_line`
- `display_address`
- `map_lat`
- `map_lng`
- `bedrooms`
- `bathrooms`
- `balconies`
- `parking_spaces`
- `floor_number`
- `total_floors`
- `size_value`
- `size_unit`
- `land_size_value`
- `land_size_unit`
- `plot_type`
- `facing`
- `handover_status`
- `handover_date`
- `furnishing_status`
- `amenities_json`
- `nearby_places_json`
- `owner_note`
- `admin_note`
- `featured`
- `approved_by_user_id`
- `approved_at`
- `published_at`
- `rejected_at`
- `unpublished_at`
- `created_at`
- `updated_at`

## Listing Status Values
- `draft`
- `pending_review`
- `approved`
- `rejected`
- `unpublished`
- `archived`

## `property_images`
- `id`
- `listing_id`
- `storage_path`
- `public_url`
- `alt_text`
- `sort_order`
- `is_cover`
- `uploaded_by_user_id`
- `created_at`

## `property_inquiries`
- `id`
- `listing_id`
- `name`
- `phone`
- `email`
- `message`
- `preferred_contact_method`
- `source_page`
- `ip_hash`
- `user_agent`
- `status`
- `assigned_admin_user_id`
- `created_at`
- `updated_at`

## `property_audit_logs`
- `id`
- `listing_id`
- `actor_user_id`
- `action`
- `from_status`
- `to_status`
- `note`
- `metadata_json`
- `created_at`

## Public Schema Rule
Public schemas exclude owner private data and admin-only fields.

## Runtime Guard Rule
- Backend startup must fail closed if `DATABASE_URL` points to `clearlyhired_v2.db` or a ClearlyHired path.
- Allowed defaults are `realestate_mvp_v1.db` for app runtime and `test_realestate_mvp_v1.db` for tests.
