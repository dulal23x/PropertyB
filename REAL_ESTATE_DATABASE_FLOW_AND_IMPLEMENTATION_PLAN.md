# Real Estate Database Flow And Implementation Plan

Status: Implementation planning artifact  
Location: `C:\realestatesite\REAL_ESTATE_DATABASE_FLOW_AND_IMPLEMENTATION_PLAN.md`  
Decision: SQLite MVP first, with disciplined schema and query design for later PostgreSQL migration  
Backend source of truth: `C:\realestatesite\app\backend`  
Frontend target: `C:\realestatesite\nextjs-frontend`  
Canonical MVP database: `realestate_mvp_v1.db`  
Demo/seed source only: `bproperty_clone.db`

## Page 01 - Executive Summary And Decision

The project should standardize on the existing FastAPI backend in `app/backend` as the main backend and database owner. The Next.js frontend should not own business data, listing lifecycle, approval rules, inquiry handling, email logs, or schema migrations. The frontend should become a clean API consumer after the database and API contracts are stabilized.

The database direction is SQLite MVP first. This keeps the current local development and demo workflow simple, but the schema must be designed as if it will later move to PostgreSQL. That means clear public IDs, consistent timestamps, constrained enum values, normalized core entities, query-shape indexes, and no frontend dependency on SQLite-specific behavior.

The current backend already has most of the intended MVP tables:

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

The current backend also has `*_v2` mirror tables created at startup for future migration readiness. These mirror tables should remain backend-only for now. The frontend should read normal API responses, not v2 tables.

Critical decision:

```text
Frontend UI -> FastAPI API -> canonical MVP tables -> v2 mirror tables for readiness only
```

Do not build a second backend inside Next.js unless it is a thin proxy or BFF with no independent database ownership.

## Page 02 - Source Documents Reviewed And Current Implementation Reality

This plan is based on the current project documents and live code shape.

Root planning docs:

- `REAL_ESTATE_MVP_CLONE_IMPLEMENTATION_PLAN_BN.md`
- `BPROPERTY_20_PHASE_CLONE_PLAN.md`

Canonical docs pack:

- `real-estate-docs/PROJECT_MASTER_RULES.md`
- `real-estate-docs/MASTER_INDEX.md`
- `real-estate-docs/01-architecture/DATABASE_SCHEMA_PLAN.md`
- `real-estate-docs/01-architecture/DATA_FLOW.md`
- `real-estate-docs/01-architecture/BACKEND_ARCHITECTURE.md`
- `real-estate-docs/01-architecture/FRONTEND_ARCHITECTURE.md`
- `real-estate-docs/05-contracts/API_CONTRACTS.md`
- `real-estate-docs/05-contracts/SCHEMA_CONTRACTS.md`
- `real-estate-docs/05-contracts/STORAGE_CONTRACTS.md`
- `real-estate-docs/05-contracts/UI_ROUTE_MAP.md`
- `real-estate-docs/04-features/*`
- `real-estate-docs/06-operations/*`

Live code reality:

- `nextjs-frontend` has no source API route backend and no Prisma, Drizzle, Supabase, or ORM schema.
- `nextjs-frontend` directly calls `http://127.0.0.1:8090` from several pages.
- `app/backend` is the real backend with FastAPI, async SQLAlchemy, auth, property routes, admin routes, email service, and schema bootstrap.
- `bproperty_clone.db` currently contains seeded/demo listing data and v2 mirror tables.
- `realestate_mvp_v1.db` remains the intended canonical database name from docs and should be the final runtime default.

The root Bangla MVP plan contains useful product intent, but some Bangla output is encoding-corrupted in this terminal environment. The structured docs under `real-estate-docs` are cleaner and should be treated as the current implementation guide.

## Page 03 - Current Frontend Feature Inventory

The current Next.js frontend includes these visible product surfaces.

Homepage:

- Hero search widget with sale/rent toggle.
- Location input mapped to `area_name`.
- Property type selector mapped to `property_type`.
- Budget selector mapped to `min_price` and `max_price`.
- Bedroom selector mapped to `bedrooms`.
- Featured properties fetched from `/properties?sort=featured_first&page_size=3`.
- City browse links for Dhaka, Chattogram, Sylhet.
- Type browse links for Apartments, Houses, Commercial, Land, Duplex.
- Static promotional sections for projects, insights, and post-property CTA.

Public search page:

- `/properties` route.
- Client-side fetch to `/properties`.
- Filters for `purpose`, `property_type`, `min_price`, `max_price`, `bedrooms`, `sort`, and `area_name`.
- Desktop sidebar and mobile drawer.
- Grid/list view toggle.
- Static pagination UI.

Property detail page:

- `/properties/[slug]` route.
- Fetches `/properties/{slug}`.
- Displays title, price, location, image gallery, facts, description, static amenities, company/agency block, phone CTA, and inquiry form.
- Inquiry form is currently not API-wired.

Auth pages:

- `/auth/login`.
- `/auth/register`.
- Login currently sends form-encoded `username/password`, which does not match backend JSON `email/password`.
- Register sends JSON but stores phone into `full_name`, which is a placeholder behavior.
- Tokens are not persisted into `realestate_auth_user` or `realestate_auth`.

Dashboard:

- `/dashboard/layout`.
- `/dashboard/listings`.
- `/dashboard/listings/new`.
- Listings page uses mock data.
- New listing form is static and not wired to APIs.

Post property:

- `/post-property`.
- Rich multi-section form UI.
- Submission is a timeout and alert, not a backend call.

Shared UI:

- Navbar links: Buy, Rent, Advertise, Post Property, login.
- Footer links include property query links.
- Property cards expect fields like `currency`, `price_amount`, `cover_image_url`, `image_count`, `business_phone`.

## Page 04 - Previously Planned Feature Inventory

The docs define the real product scope more completely than the current UI.

Public visitor features:

- Search approved listings only.
- View approved listing detail pages.
- Submit property inquiries.
- See only business/company contact information.
- Browse by location, purpose, type, price, bedrooms, bathrooms, size, land size, and price visibility.
- View SEO-safe approved listing pages.

Owner features:

- Register and login.
- Create listing draft.
- Upload listing images.
- Submit listing for review.
- See listing statuses.
- See rejection reason where applicable.
- Edit draft, rejected, unpublished, and approved listings according to lifecycle rules.
- Archive listing where allowed.

Admin features:

- View pending listing queue.
- View all listings.
- Approve, reject, unpublish, archive.
- Require rejection note.
- View owner info.
- View images and validation checklist.
- Manage inquiries.
- Manage users.
- View and edit email templates.
- View email logs and sent content.

System features:

- Password reset.
- Email logging for all sends.
- Console email provider for development.
- SMTP email only after domain verification.
- Runtime DB guard against old ClearlyHired database paths.
- Public data leak tests.
- Backup and recovery plan.

Deferred features:

- Payments and subscriptions.
- MLS integration.
- Map polygon search.
- Live chat.
- Mobile app.
- Agent marketplace.
- Owner-facing inquiry details unless business explicitly approves it later.

## Page 05 - Current Backend And Database Inventory

The current backend lives in `app/backend`.

Main files:

- `app/main.py`
- `app/core/config.py`
- `app/core/deps.py`
- `app/core/security.py`
- `app/db/session.py`
- `app/db/bootstrap.py`
- `app/models/entities.py`
- `app/routes/auth.py`
- `app/routes/properties.py`
- `app/routes/admin.py`
- `app/services/email_service.py`
- `app/services/property_policies.py`

Current backend strengths:

- FastAPI routing is already separated by auth, properties, admin, and health.
- JWT auth exists.
- Password reset models and routes exist.
- Property lifecycle exists.
- Admin approval, rejection, unpublish, archive, users, inquiries, and email routes exist.
- Public property routes already hide owner/admin fields by mapping through response functions.
- Startup creates schema and applies additive runtime schema updates.
- v2 mirror tables, triggers, and drift endpoints are already present.

Current backend gaps:

- Default config currently points to `bproperty_clone.db`; final plan should move canonical runtime to `realestate_mvp_v1.db`.
- SQLite test execution hit `disk I/O error` in this environment and needs environment cleanup before using tests as a green signal.
- Rate-limit config fields exist but enforcement is not fully implemented.
- `public_shape` should include `currency` and `price_visibility` consistently for frontend stability.
- Query aliases should be normalized more defensively for frontend compatibility.
- Image storage currently accepts public URLs; true upload/storage flow needs a stronger plan.

## Page 06 - Database Goals And Fail-Closed Rules

The database must support a small but real business workflow without critical failure in privacy, lifecycle, or search.

Primary goals:

- Keep listing ownership clear.
- Keep approval workflow auditable.
- Keep public and private fields separated.
- Keep search queries fast enough for MVP scale.
- Keep seeded demo data separate from source-of-truth runtime data.
- Keep a clear path to PostgreSQL later.

Fail-closed rules:

- Public search returns only `status = approved`.
- Public detail returns only `status = approved`.
- Public payload never includes owner email, owner phone, owner user id, private address, admin note, or audit logs.
- Admin approval is impossible without admin auth.
- Listing approval is blocked if public business phone is not configured.
- Inquiry create is allowed only for approved listings.
- Production SMTP is blocked unless sender domain is verified.
- Startup fails if database URL points to ClearlyHired or an old reference database.
- Frontend cannot bypass backend lifecycle rules.

Canonical database rule:

```text
realestate_mvp_v1.db is the MVP runtime database.
bproperty_clone.db is seed/demo input only unless manually promoted through a migration script.
```

## Page 07 - Canonical Entity Relationship Model

Core relationships:

```text
users 1 -> many property_listings
users 1 -> many property_images uploaded_by_user_id
users 1 -> many property_audit_logs actor_user_id
property_listings 1 -> many property_images
property_listings 1 -> many property_inquiries
property_listings 1 -> many property_audit_logs
email_logs 1 -> many email_attachments
email_templates standalone by template_key
password_reset_tokens standalone by email/token
security_events standalone audit stream
```

Business ownership:

- `users` own accounts and roles.
- `property_listings` own listing facts and lifecycle.
- `property_images` own ordered listing media metadata.
- `property_inquiries` own visitor contact requests.
- `property_audit_logs` own lifecycle accountability.
- `email_logs` own send attempts and operational history.
- `email_templates` own editable notification content.

Public read model:

```text
property_listings approved rows
plus cover image
plus image count
plus business contact from config
```

Admin read model:

```text
property_listings all statuses
plus owner user
plus images
plus inquiries
plus audit logs
plus email logs when relevant
```

Owner read model:

```text
property_listings where owner_user_id = current_user.id
plus images
plus safe admin feedback
plus next_action
```

## Page 08 - Users And Auth Session Data Flow

Current schema:

```text
users.id integer primary key
users.email unique indexed
users.password_hash
users.role
users.full_name
users.is_active
users.created_at
```

MVP role values:

```text
client
admin
```

Frontend labels:

- `client` can be displayed as Property Owner, Owner, or Account.
- `admin` is the operational admin.

Auth flow:

1. User registers through `/auth/register`.
2. Backend stores lowercase email and hashed password.
3. Backend returns bearer token.
4. Frontend stores token in `realestate_auth_user`.
5. Frontend sets `realestate_auth` presence cookie for route guards.
6. Protected frontend calls send `Authorization: Bearer <token>`.
7. Backend resolves current user through `/auth/me`.

Required frontend storage shape:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "owner@example.com",
    "role": "client",
    "full_name": "Owner"
  }
}
```

Fix required:

- Login must send JSON `{ "email": "...", "password": "..." }`.
- Register must not abuse `full_name` for phone.
- Phone should either be deferred or stored in a future `user_profiles` table, not squeezed into `full_name`.

Future PostgreSQL readiness:

- Add `public_id` UUID in v2 or migration path.
- Keep integer primary key for SQLite MVP until cutover.
- Never expose numeric `id` publicly where a public UUID is available later.

## Page 09 - Property Listings Schema And Lifecycle

Current core fields:

```text
id
owner_user_id
title
slug
description
listing_purpose
property_type
property_subtype
status
price_amount
price_label
price_visibility
currency
price_period
division
district
city
area_name
address_line
display_address
bedrooms
bathrooms
balconies
parking_spaces
floor_number
total_floors
size_value
size_unit
land_size_value
land_size_unit
plot_type
facing
handover_status
handover_date
furnishing_status
amenities_json
nearby_places_json
map_lat
map_lng
owner_note
admin_note
featured
approved_by_user_id
approved_at
published_at
rejected_at
unpublished_at
created_at
updated_at
```

Required listing statuses:

```text
draft
pending_review
approved
rejected
unpublished
archived
```

Allowed listing purposes:

```text
sale
rent
```

Allowed property types:

```text
apartment
house
land
commercial
office
shop
warehouse
factory
other
```

Lifecycle:

1. Owner creates listing as `draft`.
2. Owner uploads one or more images.
3. Owner submits listing.
4. Backend validates required fields and image count.
5. Backend sets `pending_review`.
6. Admin approves or rejects.
7. Approved listing becomes public.
8. Rejected listing returns to owner for edits.
9. Editing an approved listing should set status back to `pending_review` for MVP.
10. Admin can unpublish or archive.

MVP default for approved listing edits:

```text
Approved listing edit hides the public listing until reapproved.
```

Later improvement:

```text
Versioned publishing can preserve last approved version while edits wait for review.
```

## Page 10 - Property Images Schema And Storage Flow

Current schema:

```text
property_images.id
property_images.listing_id
property_images.storage_path
property_images.public_url
property_images.alt_text
property_images.sort_order
property_images.is_cover
property_images.uploaded_by_user_id
property_images.created_at
```

Storage contract:

```text
userdata/property-images/{listing_id}/{image_id}.{ext}
```

Current backend behavior accepts image metadata with a `public_url`. This is acceptable for seed data and demo, but the production-ready MVP should implement actual file upload or signed upload flow before launch.

Rules:

- Max 10 images per listing.
- Max 5 MB per image.
- Allowed extensions: `jpg`, `jpeg`, `png`, `webp`.
- At least one image is required before submission and approval.
- Only one cover image should be active per listing.
- Public APIs expose images only for approved listings.
- Owner APIs expose images only for own listings.
- Admin APIs expose images for all listings.

DB flow:

1. Owner creates listing.
2. Owner uploads or submits image metadata.
3. Backend validates listing ownership.
4. Backend validates extension, size, and count.
5. Backend stores metadata row.
6. Backend clears previous cover if new image has `is_cover = true`.
7. Backend writes audit log `image_added`.

Required repair:

- Add a real upload endpoint or a controlled local file write path.
- Ensure `public_url` for local images resolves through `/images/...`.
- Ensure `next.config.mjs` allows the backend image host used by runtime config.

## Page 11 - Property Inquiries Schema And Admin Handling

Current schema:

```text
property_inquiries.id
property_inquiries.listing_id
property_inquiries.name
property_inquiries.phone
property_inquiries.email
property_inquiries.message
property_inquiries.preferred_contact_method
property_inquiries.source_page
property_inquiries.ip_hash
property_inquiries.user_agent
property_inquiries.status
property_inquiries.assigned_admin_user_id
property_inquiries.created_at
property_inquiries.updated_at
```

Allowed statuses:

```text
new
contacted
closed
spam
```

Public inquiry flow:

1. Visitor opens approved listing detail.
2. Visitor submits name, phone, optional email, optional message, and preferred contact method.
3. Backend verifies listing exists and is approved.
4. Backend hashes requester IP.
5. Backend stores inquiry.
6. Backend logs/sends admin alert.
7. Backend logs/sends visitor confirmation if email exists.
8. Backend returns success without exposing admin email or owner data.

Admin inquiry flow:

1. Admin lists inquiries by newest first.
2. Admin filters by status, listing, phone, email, or keyword.
3. Admin marks contacted, closed, or spam.
4. Admin can open linked listing and owner account.

Privacy rule:

```text
Listing owner does not receive visitor details directly in MVP.
```

Frontend repair:

- Wire detail page form to `POST /properties/{listing_id}/inquiries`.
- Disable submit until name and phone are present.
- Show success and error states.
- Do not store inquiry data in localStorage.

## Page 12 - Property Audit Logs And Approval Accountability

Current schema:

```text
property_audit_logs.id
property_audit_logs.listing_id
property_audit_logs.actor_user_id
property_audit_logs.action
property_audit_logs.from_status
property_audit_logs.to_status
property_audit_logs.note
property_audit_logs.metadata_json
property_audit_logs.created_at
```

Required actions:

```text
created
updated
submitted
approved
rejected
unpublished
archived
image_added
image_removed
admin_edited
```

Rules:

- Every lifecycle-changing action writes an audit log.
- Admin rejection note is stored in `admin_note` and audit `note`.
- Public never sees audit logs.
- Owner can later receive a simplified timeline if needed.
- Admin can see full audit trail.

Critical implementation point:

```text
Do not rely on timestamps alone to infer lifecycle. The audit table is the accountability source.
```

PostgreSQL readiness:

- Keep `metadata_json` valid JSON.
- Store actor references as foreign keys now.
- Add `public_id` in v2 path for external references.

## Page 13 - Email Logs, Templates, And Notification Flow

Current email-related tables:

```text
email_logs
email_attachments
email_templates
```

Required template keys:

```text
welcome_email
password_reset
listing_submitted_owner
listing_submitted_admin
listing_approved_owner
listing_rejected_owner
listing_unpublished_owner
inquiry_received_admin
inquiry_confirmation_visitor
admin_custom_email
```

Email flow rules:

- Every send attempt creates an `email_logs` row.
- Development uses `EMAIL_PROVIDER=console`.
- Production SMTP requires verified sender domain.
- Admin email composer is admin-only.
- Email template edits are admin-only.
- Old sender domains and old product branding must not be used.

Listing notification flow:

1. Owner submits listing.
2. Owner receives submission confirmation.
3. Admin receives pending review alert.
4. Admin approves or rejects.
5. Owner receives approval or rejection email.

Inquiry notification flow:

1. Visitor submits inquiry.
2. Admin receives inquiry alert.
3. Visitor receives confirmation only if email is supplied.

DB plan:

- Keep email logs in main DB for MVP.
- Later, high-volume email events can move to an event table or separate log store.

## Page 14 - Security Events And Rate Limit Records

Current schema:

```text
security_events.id
security_events.event_type
security_events.ip
security_events.detail
security_events.created_at
```

Current config includes:

```text
admin_write_hourly_limit
register_ip_limit_per_hour
login_max_failed_attempts
```

Required MVP behavior:

- Log failed login bursts.
- Log suspicious registration bursts.
- Log admin write operations that exceed threshold.
- Return `429` with structured detail and `Retry-After` where rate limit is enforced.

Recommended rate-limit events:

```text
login_failed
login_rate_limited
register_rate_limited
inquiry_rate_limited
admin_write_rate_limited
password_reset_requested
password_reset_rate_limited
```

SQLite MVP implementation:

- Use `security_events` as the record source for simple time-window counts.
- Add indexed fields later if volume increases.

PostgreSQL readiness:

- Dedicated rate-limit table or Redis can be introduced later.
- Do not design frontend behavior around a particular rate-limit backend.

## Page 15 - Search And Filter Schema Requirements

Current frontend filter inputs:

```text
purpose
property_type
min_price
max_price
bedrooms
sort
area_name
city via homepage links
type via homepage type links
```

Docs-required filters:

```text
keyword
listing_purpose
property_type
division
district
city
area_name
min_price
max_price
bedrooms
bathrooms
min_size
max_size
size_unit
land_size_min
land_size_max
land_size_unit
price_visibility
sort
page
page_size
```

Backend should support aliases:

```text
purpose -> listing_purpose
type -> property_type
area -> area_name
```

Frontend should normalize to canonical params before calling the API:

```text
listing_purpose
property_type
area_name
```

Sort values:

```text
newest
price_asc
price_desc
size_desc
featured_first
```

Special handling:

- Bedroom value `4+` should become `min_bedrooms=4` in a future API or be converted to exact `4` only if the UI means exactly four.
- Lowercase city slugs from links should be converted to display-safe values or matched case-insensitively.
- Empty filters should be omitted.

DB requirement:

- All public search queries include `status = approved`.
- Query plans must remain efficient under common filters.

## Page 16 - Homepage Data Requirements

Current homepage uses:

- Featured listings from API.
- Static city counts.
- Static property type counts.
- Static insights and projects content.

Required backend-supported homepage blocks:

```text
featured approved listings
latest approved listings
popular cities count
popular areas count
property type counts
sale/rent counts
```

MVP approach:

- Keep static city and category cards for now.
- Make featured listings real from `/properties?sort=featured_first&page_size=3`.
- Add a later lightweight stats endpoint only after frontend repair is stable.

Recommended future endpoint:

```text
GET /properties/facets
```

Response shape:

```json
{
  "cities": [{ "city": "Dhaka", "count": 120 }],
  "areas": [{ "area_name": "Gulshan", "city": "Dhaka", "count": 24 }],
  "property_types": [{ "property_type": "apartment", "count": 80 }],
  "purposes": [{ "listing_purpose": "sale", "count": 60 }]
}
```

Do not block MVP on facets. Search/detail and listing lifecycle are higher priority.

## Page 17 - Public Listing Detail Data Requirements

Detail page requires:

```text
id
slug
title
description
listing_purpose
property_type
price_amount
price_label
price_visibility
currency
price_period
city
area_name
display_address
bedrooms
bathrooms
balconies
parking_spaces
floor_number
total_floors
size_value
size_unit
land_size_value
land_size_unit
facing
handover_status
furnishing_status
amenities_json
nearby_places_json
images
business_phone
business_email
```

Public detail must not include:

```text
owner_user_id
owner email
owner phone
address_line if private
owner_note
admin_note
audit logs
assigned admin data
```

Current issue:

- Detail page renders hardcoded amenities.
- Detail page displays `property.currency`, but public response must consistently include it.
- Inquiry form is not wired.
- Phone number is hardcoded in UI rather than fully sourced from backend/config.

Backend repair:

- Include `currency` and `price_visibility` in `public_shape`.
- Parse `amenities_json` into an array field if possible.
- Keep raw JSON string as fallback only for admin/owner routes.

Frontend repair:

- Render price based on `price_visibility`.
- Render amenities from API.
- Use `business_phone` from API.
- Submit inquiry through API.

## Page 18 - Owner Dashboard Data Requirements

Owner dashboard needs listing rows:

```text
id
slug
title
status
listing_purpose
property_type
city
area_name
price_amount
price_visibility
currency
cover_image_url
image_count
updated_at
created_at
next_action
admin_note when rejected/unpublished where allowed
```

Owner listing detail/edit needs full editable fields:

```text
all listing input fields
images
status
next_action
owner_note
admin feedback where safe
```

Owner actions by status:

```text
draft: edit, submit, delete
pending_review: view
approved: view public, edit/resubmit, archive
rejected: view note, edit, resubmit
unpublished: view, edit/resubmit if allowed
archived: view only
```

Current issue:

- Dashboard listings page uses mock rows.
- New listing page is static.
- Post-property page is static.
- Auth token is not persisted, so protected owner routes cannot work.

Fix order:

1. Fix login/register storage.
2. Add API client helper.
3. Wire `/dashboard/listings` to `GET /properties/me`.
4. Wire create/edit form to `POST /properties` and `PUT /properties/me/{id}`.
5. Wire submit to `/properties/me/{id}/submit`.
6. Wire image upload or image metadata endpoint.

## Page 19 - Admin Dashboard Data Requirements

Admin dashboard needs:

```text
pending listings count
approved listings count
rejected listings count
unpublished listings count
new inquiries count
total users count
emails sent count
latest pending listings
latest inquiries
```

Admin listing queue needs:

```text
id
slug
title
owner_user_id
owner email
status
listing_purpose
property_type
city
area_name
price_amount
price_visibility
created_at
updated_at
cover_image_url
image_count
```

Admin review page needs:

```text
listing full data
owner data
images
audit logs
validation checklist
approval controls
rejection note field
```

Admin inquiry page needs:

```text
inquiry data
listing title
listing slug
status actions
visitor contact data
```

Current issue:

- Current Next.js frontend has no admin frontend routes.
- Backend admin routes exist.

Plan:

- Build admin UI only after public and owner flows are stable.
- Admin pages can be utilitarian and dense.
- Admin routes must require `role = admin` from `/auth/me`.

## Page 20 - Image Upload And Media Storage Flow

The current plan and current backend support image metadata, but a real website needs controlled media storage.

MVP acceptable modes:

```text
Mode A: local backend file upload to userdata/property-images
Mode B: controlled seed/demo public URLs for imported Bproperty clone data
```

Recommended MVP mode:

```text
Use backend-local upload for user-created listings. Keep external/seed URLs only for seeded demo listings.
```

Required endpoint shape:

```text
POST /properties/me/{listing_id}/images
Content-Type: multipart/form-data
file: image
alt_text: optional
is_cover: boolean
```

Current endpoint shape:

```json
{
  "public_url": "https://img.example.com/file.jpg",
  "alt_text": "optional",
  "is_cover": true,
  "byte_size": 1024
}
```

Transition plan:

1. Keep current metadata endpoint for seeded and compatibility flows.
2. Add upload endpoint or extend current endpoint carefully.
3. Store file under `userdata/property-images/{listing_id}`.
4. Generate `/images/{listing_id}/{filename}` public URL.
5. Validate file content type and extension.
6. Update frontend image uploader.

Do not store user-uploaded images under `nextjs-frontend/src` or `nextjs-frontend/public`.

## Page 21 - Privacy Boundaries And Public Response Schemas

Public schema is the most important safety boundary.

Public listing list response can include:

```text
id
slug
title
description summary if needed
listing_purpose
property_type
status = approved only
division
district
city
area_name
display_address
price_amount
price_label
price_visibility
currency
price_period
bedrooms
bathrooms
size_value
size_unit
land_size_value
land_size_unit
featured
cover_image_url
image_count
business_phone
business_email
```

Public detail response can include:

```text
list fields plus full description, images, amenities, nearby places, public map fields
```

Never include:

```text
owner_user_id
owner email
owner phone
owner_note
admin_note
audit_logs
assigned_admin_user_id
password fields
private address fields
security events
email logs
```

Test requirement:

```text
Fetch public list and detail JSON. Assert private values are absent from serialized payload.
```

Frontend rule:

```text
Do not rely on frontend hiding for privacy. Backend response must not contain private data.
```

## Page 22 - Index Plan For Current SQLite Scale

Current indexes on canonical tables are not enough for all expected query shapes. Existing v2 indexes are better, but current APIs still read canonical tables.

Required canonical SQLite indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_pl_status_created ON property_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pl_status_city_area ON property_listings(status, city, area_name);
CREATE INDEX IF NOT EXISTS idx_pl_status_purpose_type ON property_listings(status, listing_purpose, property_type);
CREATE INDEX IF NOT EXISTS idx_pl_status_featured_created ON property_listings(status, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pl_price ON property_listings(price_amount);
CREATE INDEX IF NOT EXISTS idx_pl_size ON property_listings(size_value);
CREATE INDEX IF NOT EXISTS idx_pl_land_size ON property_listings(land_size_value);
CREATE INDEX IF NOT EXISTS idx_pi_listing_cover_sort ON property_images(listing_id, is_cover DESC, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_inq_status_updated ON property_inquiries(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_inq_listing_created ON property_inquiries(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_to_created ON email_logs(to_email, created_at DESC);
```

Search query shapes to protect:

```text
approved newest
approved featured first
approved city/area
approved purpose/type
approved price range
approved size range
admin status queue
admin inquiry status queue
email user history
```

SQLite limitations:

- Full-text keyword search with `LIKE` is acceptable for MVP but not ideal.
- Later PostgreSQL should use full-text search or trigram search.
- SQLite write concurrency is limited, so admin/user writes should stay simple.

## Page 23 - V2 Mirror, Backfill, And Drift Plan

Current backend creates v2 tables:

```text
users_v2
property_listings_v2
property_images_v2
property_inquiries_v2
property_audit_logs_v2
email_logs_v2
password_reset_tokens_v2
security_events_v2
migration_state
backfill_checkpoints
```

Current behavior:

- Startup creates v2 tables.
- Startup creates v2 indexes.
- Startup creates triggers.
- Startup backfills existing rows through idempotent insert.
- Admin migration endpoint reports drift counts.

Rule:

```text
Current frontend and public API must not depend on v2 tables directly.
```

Use v2 for:

- Future public IDs.
- Future PostgreSQL shape validation.
- Drift detection.
- Backfill readiness.
- Migration rehearsal.

Do not use v2 for:

- Frontend direct data access.
- New business logic before canonical API contract is stable.
- Manual edits outside migration scripts.

Required hardening:

- Add canonical table indexes, not only v2 indexes.
- Add tests for v2 drift endpoint.
- Confirm v2 row counts match canonical row counts after seed and smoke flows.

## Page 24 - Later PostgreSQL Migration Path

The project should not jump to PostgreSQL before MVP behavior works. It should, however, avoid decisions that make PostgreSQL painful later.

PostgreSQL target improvements:

- Native UUID `public_id` columns.
- JSONB for `amenities_json`, `nearby_places_json`, and audit metadata.
- Real enum types or constrained lookup tables.
- Foreign key enforcement with explicit delete behavior.
- Better full-text search.
- Better concurrent writes.
- Managed backups and point-in-time recovery.

Migration sequence:

1. Stabilize SQLite canonical schema and API behavior.
2. Ensure all rows have `public_id` in v2 tables.
3. Ensure all JSON text fields contain valid JSON.
4. Build Alembic migrations for PostgreSQL.
5. Export canonical/v2 data from SQLite.
6. Load into PostgreSQL staging.
7. Run contract tests against PostgreSQL staging.
8. Run frontend smoke against PostgreSQL staging.
9. Freeze writes during final cutover.
10. Promote PostgreSQL runtime only after acceptance gates pass.

Avoid now:

- SQLite-only query logic in API handlers.
- Frontend assumptions about integer IDs.
- Invalid JSON stored in text fields.
- Business logic encoded only in triggers.

## Page 25 - Seed And Demo Data Strategy

`bproperty_clone.db` currently contains useful demo data, but it should not be the canonical product runtime database.

Decision:

```text
bproperty_clone.db is seed/demo input only unless explicitly promoted.
realestate_mvp_v1.db is the canonical MVP runtime target.
```

Seed data goals:

- Provide realistic approved listings.
- Provide at least one draft listing.
- Provide at least one pending listing.
- Provide at least one rejected listing.
- Provide images for public cards and detail pages.
- Provide admin account.
- Provide owner account.
- Provide email templates.

Required seed users:

```text
admin@realestate.local
owner@realestate.local
buyer@realestate.local
```

Required seed listings:

```text
approved apartment in Gulshan
approved land in Purbachal
approved commercial space in Motijheel
pending apartment in Uttara
rejected land listing with note
draft house listing
```

Promotion rules:

- Do not copy old/private data blindly.
- Normalize city, area, type, purpose, price, and image paths.
- Mark imported public listings as seed/demo owner.
- Keep original scraped data files under `userdata/seed_data`.

## Page 26 - API Repair Plan After Database Stabilization

Repair backend API contract first, then frontend consumers.

Backend repairs:

1. Set final default DB target to `realestate_mvp_v1.db`.
2. Keep unsafe DB guard.
3. Add canonical table indexes from Page 22.
4. Add `currency` and `price_visibility` to all public listing payloads.
5. Add defensive support for frontend aliases: `purpose`, `type`, and canonical params.
6. Normalize city matching case-insensitively or force frontend canonical casing.
7. Add or clarify image upload endpoint.
8. Add public inquiry rate limit.
9. Add contract tests for public privacy and owner/admin lifecycle.
10. Keep v2 drift endpoint and test it.

Frontend API repairs:

1. Add `src/lib/api.ts` with one API base URL.
2. Add `src/lib/auth.ts` for `realestate_auth_user` and `realestate_auth`.
3. Add `src/lib/property-api.ts`.
4. Add `src/lib/admin-property-api.ts`.
5. Add `src/lib/inquiry-api.ts`.
6. Replace hardcoded fetch calls.
7. Normalize query params before fetch.
8. Wire protected dashboard calls.
9. Wire inquiry form.
10. Add error/loading states.

Contract rule:

```text
API_CONTRACTS.md and SCHEMA_CONTRACTS.md must be updated in the same task as behavior changes.
```

## Page 27 - Frontend Broken Feature Repair List

Fix after DB/API stabilization, in this order:

1. Fix login request body to backend JSON `email/password`.
2. Store auth token and current user in `realestate_auth_user`.
3. Set `realestate_auth` cookie for route guard presence.
4. Add logout that clears storage and cookie.
5. Replace hardcoded API URL with `NEXT_PUBLIC_API_URL` or safe fallback.
6. Replace homepage `type` links with `property_type`.
7. Normalize `purpose` to `listing_purpose` in new frontend calls.
8. Convert or redesign `4+` bedrooms filter.
9. Handle city casing and area matching consistently.
10. Render `price_visibility = call_for_price` correctly.
11. Render `currency` from API.
12. Render amenities from API instead of hardcoded list.
13. Wire inquiry form to backend.
14. Replace mock dashboard listing rows with `GET /properties/me`.
15. Wire listing form create/save.
16. Wire listing submit.
17. Wire image upload/metadata.
18. Add edit listing route.
19. Add protected dashboard route checks.
20. Add admin route checks.
21. Build admin listing queue.
22. Build admin review page.
23. Build admin inquiry page.
24. Build admin users page if not present.
25. Build admin email logs/templates UI or connect existing shell.
26. Replace static pagination with API-backed page controls.
27. Add frontend empty/error states for backend failures.
28. Add noindex metadata for dashboard/admin/auth.

Do not redesign visual style during these repairs unless the existing UI blocks correct workflow behavior.

## Page 28 - Test And Smoke Validation Matrix

Backend tests:

```text
test_auth_register_login
test_public_contract_snapshot
test_public_search_approved_only
test_public_detail_approved_only
test_owner_create_listing
test_owner_cannot_read_other_listing
test_image_validation
test_submit_requires_image
test_admin_approve
test_admin_reject_requires_note
test_inquiry_requires_approved_listing
test_inquiry_creates_email_log
test_public_payload_hides_owner_data
test_v2_drift_counts
test_unsafe_database_url_guard
```

Database tests:

```text
required tables exist
required canonical indexes exist
v2 mirror tables exist
v2 row counts match after seed
seed users exist
seed approved listings exist
public phone configured
no legacy ClearlyHired tables in active DB
```

Frontend smoke tests:

```text
home loads
home search builds canonical query
properties page fetches data
filters update URL
detail page loads approved listing
inquiry form submits
register stores token
login stores token
dashboard loads own listings
create listing saves draft
submit listing changes status
admin approves listing
approved listing appears publicly
```

Manual smoke:

1. Start backend on `8090`.
2. Start frontend on `3010`.
3. Register owner.
4. Create listing.
5. Upload image.
6. Submit for review.
7. Confirm pending listing is not public.
8. Login admin.
9. Approve listing.
10. Confirm listing appears in public search.
11. Open detail.
12. Confirm company phone is visible.
13. Confirm owner private data is absent.
14. Submit inquiry.
15. Confirm admin inquiry exists.
16. Confirm email logs exist.

## Page 29 - Release And Rollback Checklist

Before local acceptance:

- Backend health passes.
- Auth smoke passes.
- Public search smoke passes.
- Owner lifecycle smoke passes.
- Admin approval smoke passes.
- Inquiry smoke passes.
- Email logs smoke passes.
- Public data leak check passes.

Before staging:

- `DATABASE_URL` points to `realestate_mvp_v1.db` or staging DB.
- `ALLOWED_ORIGINS` includes frontend URL.
- `SECRET_KEY` is not placeholder.
- `REAL_ESTATE_PUBLIC_PHONE` is real.
- `EMAIL_PROVIDER=console` unless SMTP is verified.
- Seed script is deterministic.
- Backup procedure is documented.

Rollback:

- Stop frontend.
- Stop backend.
- Restore previous DB file backup.
- Restore previous backend build/config.
- Restore previous frontend build/config.
- Re-run health and smoke tests.

Backup:

- Copy SQLite DB before schema changes.
- Copy `userdata/property-images`.
- Copy `userdata/logs/emails` if needed.
- Record timestamp and commit/hash if git is initialized later.

Never launch if:

- Owner phone/email appears in public JSON or HTML.
- Pending/rejected listing appears publicly.
- Non-admin can approve.
- Production email sends from unverified domain.
- Frontend points to wrong backend.
- DB points to old/reference project.

## Page 30 - Final Implementation Sequence And Acceptance Gates

Implementation should be step-by-step and contract-first.

Phase 1: Database safety

- Set canonical runtime DB target.
- Preserve unsafe DB guard.
- Add canonical indexes.
- Verify schema startup.
- Verify seed/demo strategy.

Phase 2: Backend contract hardening

- Fix public response shape.
- Add frontend alias compatibility where needed.
- Add inquiry and privacy tests.
- Add v2 drift test.
- Add image upload decision or compatibility endpoint.

Phase 3: Frontend API foundation

- Add API base helper.
- Add auth storage helper.
- Add property API helpers.
- Replace hardcoded fetch calls.
- Fix login/register.

Phase 4: Public flow repair

- Homepage featured listings.
- Search filters.
- Detail page.
- Inquiry form.
- Price visibility and amenities.

Phase 5: Owner flow repair

- Dashboard real listings.
- New listing create.
- Edit listing.
- Submit for review.
- Image handling.
- Route protection.

Phase 6: Admin flow repair

- Admin dashboard.
- Listing queue.
- Review page.
- Approve/reject/unpublish.
- Inquiries.
- Users.
- Email logs/templates.

Phase 7: Release hardening

- Backend tests.
- Frontend build/lint.
- Browser smoke.
- Data leak smoke.
- Backup and rollback rehearsal.
- Docs contract updates.

Acceptance gates:

- `realestate_mvp_v1.db` is canonical runtime DB.
- Public APIs return approved listings only.
- Public APIs never expose private owner/admin fields.
- Owner can create, upload, submit, and track listings.
- Admin can approve/reject/unpublish.
- Approved listings appear publicly.
- Inquiry creates database row and email log.
- Frontend uses one API base.
- Auth persists through approved storage keys.
- v2 drift endpoint reports healthy counts.
- Manual smoke passes end to end.

Final principle:

```text
The project succeeds when the data model protects privacy, preserves approval accountability, serves search quickly enough for MVP scale, and lets the frontend consume stable contracts without owning business rules.
```
