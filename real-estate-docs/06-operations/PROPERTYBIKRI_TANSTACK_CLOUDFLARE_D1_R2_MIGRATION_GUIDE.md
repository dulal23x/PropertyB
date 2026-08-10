# PropertyBikri TanStack Start + Cloudflare D1/R2 Migration Guide

## 1. Purpose

This guide is the decision-complete migration playbook for moving PropertyBikri from the current VPS stack to a Cloudflare-first stack without losing the current design, SEO pages, listing behavior, admin tools, DB content, or property images.

Current production stack:

- Frontend: Next.js 14 app in `nextjs-frontend`
- Backend: FastAPI app in `app/backend`
- Database: SQLite file at `app/backend/realestate_mvp_v1.db`
- Runtime images: `property-images` archive at `migration/propertybikri-runtime-assets-20260810.tar.gz`
- Public site: `https://propertybikri.com`
- Public API: `https://api.propertybikri.com`

Target Cloudflare stack:

- Frontend: TanStack Start on Cloudflare Workers
- Backend: TypeScript Worker API handlers
- SQL database: Cloudflare D1
- Listing images/uploads: Cloudflare R2
- Domains preserved: `propertybikri.com`, `www.propertybikri.com`, and `api.propertybikri.com`

Official references checked for this guide:

- Cloudflare TanStack Start Workers guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/
- TanStack Start hosting guide: https://tanstack.com/start/v0/docs/framework/react/guide/hosting
- Cloudflare D1 import/export guide: https://developers.cloudflare.com/d1/best-practices/import-export-data/
- Cloudflare D1 getting started: https://developers.cloudflare.com/d1/get-started/
- Cloudflare D1 Worker API binding: https://developers.cloudflare.com/d1/worker-api/d1-database/
- Cloudflare Pages/Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/

## 2. Non-Negotiable Success Criteria

The migration is successful only when all of these are true:

- Homepage matches the current live visual design on desktop and mobile.
- Header menu, post property button, login/signup, footer logos, address, Facebook, phone, and WhatsApp behavior match production.
- Public listing search works for buy, rent, apartment, house, land, and commercial filters.
- Listing pagination works for both sale and rent.
- Listing detail pages render title, metadata, property facts, description, contact section, gallery/fallback image, and schema data.
- SEO landing pages keep their current URLs, headings, internal links, metadata, and listing previews.
- `sitemap.xml` includes static pages, SEO landing pages, listing detail pages, and no duplicates.
- `robots.txt` points search engines to the Cloudflare-hosted sitemap.
- User registration, login, profile, dashboard, listing draft/edit/submit, inquiry viewing, and image upload work.
- Admin login, listing moderation, bulk actions, users, inquiries, email logs/templates, and settings work.
- Current live SQLite data imports into D1 without row loss.
- Current live property images upload into R2 without object loss.
- Existing image URLs either continue to resolve or are mapped through a compatibility route.
- No production DNS cutover happens until preview smoke tests pass.

## 3. Current System Inventory

### 3.1 Frontend Routes To Preserve

Public routes:

- `/`
- `/properties`
- `/properties/[slug]`
- `/about`
- `/advertise`
- `/contact`
- `/careers`
- `/privacy`
- `/terms`
- `/cookies`
- `/sitemap`
- `/sitemap.xml`
- `/robots.txt`

SEO landing route pattern:

- `/[seoSlug]`

Current SEO slugs include sale, apartment, flat, house, land, commercial, and Dhaka area keyword pages. Keep all current slugs from `nextjs-frontend/src/lib/seo-pages.ts`.

Auth and dashboard routes:

- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/dashboard/listings`
- `/dashboard/listings/new`
- `/dashboard/listings/[id]/edit`
- `/dashboard/inquiries`
- `/dashboard/profile`
- `/dashboard/settings`
- `/post-property`

Admin routes:

- `/admin`
- `/admin/properties`
- `/admin/properties/[id]`
- `/admin/inquiries`
- `/admin/users`
- `/admin/email-hub`
- `/admin/email-hub/compose`
- `/admin/email-hub/templates`
- `/admin/settings`

### 3.2 Backend API Routes To Preserve

Health:

- `GET /health`
- `GET /health/email`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`
- `POST /auth/password-reset/request`
- `GET /auth/password-reset/validate`
- `POST /auth/password-reset/confirm`

Public properties:

- `GET /properties/global-contact`
- `GET /properties`
- `GET /properties/:slug`
- `POST /properties/:listing_id/inquiries`

Owner properties:

- `GET /properties/me-summary`
- `GET /properties/me/inquiries`
- `GET /properties/me`
- `POST /properties`
- `GET /properties/me/:listing_id`
- `PUT /properties/me/:listing_id`
- `POST /properties/me/:listing_id/submit`
- `GET /properties/me/:listing_id/images`
- `POST /properties/me/:listing_id/upload-image`
- `DELETE /properties/me/:listing_id/images/:image_id`
- `DELETE /properties/me/:listing_id`

Admin:

- `GET /admin/properties`
- `GET /admin/users`
- `PATCH /admin/users/:user_id`
- `GET /admin/properties/stats`
- `GET /admin/properties/:listing_id`
- `PATCH /admin/properties/:listing_id`
- `POST /admin/properties/:listing_id/approve`
- `POST /admin/properties/:listing_id/reject`
- `POST /admin/properties/:listing_id/unpublish`
- `POST /admin/properties/:listing_id/archive`
- `POST /admin/properties/bulk-approve`
- `POST /admin/properties/bulk-reject`
- `POST /admin/properties/bulk-unpublish`
- `POST /admin/properties/bulk-archive`
- `GET /admin/properties/audit-logs/recent`
- `GET /admin/inquiries`
- `GET /admin/inquiries/:inquiry_id`
- `PATCH /admin/inquiries/:inquiry_id`
- `POST /admin/inquiries/:inquiry_id/mark-contacted`
- `POST /admin/inquiries/:inquiry_id/mark-closed`
- `POST /admin/inquiries/:inquiry_id/mark-spam`
- `GET /admin/email/logs`
- `GET /admin/email/logs/:log_id/content`
- `GET /admin/email/user/:email/history`
- `POST /admin/email/send`
- `GET /admin/email/server-stats`
- `GET /admin/email/templates`
- `PUT /admin/email/templates/:template_id`
- `GET /admin/settings`
- `PUT /admin/settings/:setting_key`

Image compatibility:

- `GET /images/*`

This route must serve objects from R2 after migration.

### 3.3 Database Tables To Preserve

D1 schema must cover these current SQLite tables:

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
- `site_settings`

Preserve IDs during import. Do not remap listing IDs or image IDs unless every related foreign key and R2 path is updated in the same migration.

## 4. Target Architecture

### 4.1 Cloudflare Resources

Create these Cloudflare resources:

- Worker app for TanStack Start frontend and full-stack routing.
- Worker API routes under the same app or a separate Worker bound to `api.propertybikri.com`.
- D1 database named `propertybikri-prod`.
- R2 bucket named `propertybikri-property-images`.
- Optional preview D1 database named `propertybikri-preview`.
- Optional preview R2 bucket named `propertybikri-property-images-preview`.

Recommended bindings:

```ts
export interface Env {
  DB: D1Database;
  PROPERTY_IMAGES: R2Bucket;
  JWT_SECRET: string;
  PUBLIC_SITE_URL: string;
  PUBLIC_API_URL: string;
  REAL_ESTATE_PUBLIC_PHONE: string;
  REAL_ESTATE_PUBLIC_EMAIL: string;
  REAL_ESTATE_SUPPORT_EMAIL: string;
  REAL_ESTATE_ADMIN_ALERT_EMAIL: string;
}
```

### 4.2 Runtime Boundaries

Keep these boundaries clear:

- TanStack Start handles UI routes, SSR, SEO pages, sitemap, robots, forms, and dashboard shells.
- Worker API handlers replace FastAPI route behavior.
- D1 stores relational data.
- R2 stores property images and email attachments if attachments become active.
- Cloudflare environment variables replace `.env` files.
- No user uploads go into git or static frontend assets.

### 4.3 Recommended Repo Layout

Target layout:

```text
propertybikri-cloudflare/
  app/
    routes/
    components/
    lib/
    styles/
  worker/
    api/
    auth/
    db/
    r2/
    validation/
  migrations/
    d1/
  scripts/
    export-sqlite-for-d1.ts
    import-images-to-r2.ts
    verify-d1-counts.ts
  public/
  wrangler.jsonc
  package.json
```

During migration, keep the current repo intact until parity is proven. Build the TanStack version in a new folder or branch, then merge only when smoke tests pass.

## 5. D1 Database Migration

### 5.1 Export SQLite

From the current repo:

```bash
set -euo pipefail
cd /home/ubuntu/RealEstate/app/backend
sqlite3 realestate_mvp_v1.db ".backup '/tmp/propertybikri-live-backup.db'"
sqlite3 /tmp/propertybikri-live-backup.db ".dump" > /tmp/propertybikri-d1-import.sql
```

Clean the SQL dump before D1 import:

- Remove SQLite internal tables.
- Remove unsupported pragmas if present.
- Keep explicit `INSERT` values.
- Preserve integer primary key IDs.
- Keep timestamp values as ISO text.
- Convert booleans to `0` and `1` where needed.

### 5.2 D1 Schema Rules

Use D1-compatible SQLite syntax:

- `INTEGER PRIMARY KEY` for IDs.
- `TEXT` for timestamps.
- `TEXT` for JSON blobs.
- `REAL` or `NUMERIC` for price/size values.
- `INTEGER` for booleans.
- Explicit indexes for listing filters.

Required indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_property_listings_slug ON property_listings(slug);
CREATE INDEX IF NOT EXISTS idx_property_listings_status ON property_listings(status);
CREATE INDEX IF NOT EXISTS idx_property_listings_purpose ON property_listings(listing_purpose);
CREATE INDEX IF NOT EXISTS idx_property_listings_type ON property_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_city ON property_listings(city);
CREATE INDEX IF NOT EXISTS idx_property_listings_district ON property_listings(district);
CREATE INDEX IF NOT EXISTS idx_property_listings_featured ON property_listings(featured);
CREATE INDEX IF NOT EXISTS idx_property_images_listing ON property_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_listing ON property_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 5.3 Create D1

```bash
npm install -D wrangler
npx wrangler login
npx wrangler d1 create propertybikri-prod
npx wrangler d1 create propertybikri-preview
```

Add the returned database IDs to `wrangler.jsonc`.

### 5.4 Import D1

```bash
npx wrangler d1 execute propertybikri-preview --remote --file=/tmp/propertybikri-d1-import.sql
```

After preview succeeds:

```bash
npx wrangler d1 execute propertybikri-prod --remote --file=/tmp/propertybikri-d1-import.sql
```

### 5.5 Verify D1 Counts

Run count checks against SQLite and D1 for every table:

```sql
SELECT 'users', count(*) FROM users;
SELECT 'property_listings', count(*) FROM property_listings;
SELECT 'property_images', count(*) FROM property_images;
SELECT 'property_inquiries', count(*) FROM property_inquiries;
SELECT 'property_audit_logs', count(*) FROM property_audit_logs;
SELECT 'email_logs', count(*) FROM email_logs;
SELECT 'email_templates', count(*) FROM email_templates;
SELECT 'site_settings', count(*) FROM site_settings;
```

Migration cannot proceed to DNS cutover until every table count matches.

## 6. R2 Image Migration

### 6.1 Extract Current Assets

```bash
set -euo pipefail
cd /home/ubuntu/RealEstate
mkdir -p /tmp/propertybikri-images
tar -C /tmp/propertybikri-images -xzf migration/propertybikri-runtime-assets-20260810.tar.gz
find /tmp/propertybikri-images/property-images -type f | wc -l
```

Expected object count from current archive: 327 files.

### 6.2 R2 Key Format

Use stable R2 keys:

```text
property-images/<listing-id>/<filename>
```

Do not include `userdata/` in the R2 object key.

### 6.3 Upload To R2

Use Wrangler or an S3-compatible R2 upload script.

Required behavior:

- Upload every file under `property-images`.
- Preserve subfolder/listing ID structure.
- Preserve file extension.
- Store content type based on extension.
- Fail the script if upload count does not equal local file count.

### 6.4 Image Route Compatibility

Current backend serves:

```text
/images/<listing-id>/<filename>
```

The Cloudflare Worker must implement:

```ts
GET /images/:listingId/:filename
```

Handler behavior:

- Build R2 key as `property-images/${listingId}/${filename}`.
- Fetch from `env.PROPERTY_IMAGES`.
- Return `404` if missing.
- Set `Content-Type` from R2 metadata or file extension.
- Set browser cache headers for public property images.

Do not expose direct signed upload URLs in v1 unless admin/user upload flow requires it. Keep uploads going through authenticated Worker API so ownership and file count rules remain enforced.

## 7. Worker API Migration

### 7.1 Auth

Preserve current token behavior:

- email/password login
- JWT bearer token
- `role` values: `admin`, `client`
- inactive users cannot authenticate

Implementation requirements:

- Use Web Crypto APIs where possible.
- Keep password hash compatibility or force password reset during cutover.
- If existing `passlib[bcrypt]` hashes cannot be verified reliably in Workers, document a controlled password reset flow before cutover.
- Store reset tokens in D1 with expiry and used flag.

### 7.2 Public Listing Search

`GET /properties` must preserve these query inputs:

- `page`
- `page_size`
- `purpose`
- `listing_purpose`
- `property_type`
- `city`
- `district`
- `area_name`
- `min_price`
- `max_price`
- bedroom/bathroom filters if currently accepted

Response shape:

```ts
type PropertyListResponse = {
  items: PropertyListItem[];
  page: number;
  page_size: number;
  total: number;
};
```

Sort order:

- featured listings first
- newest/updated listings after featured
- deterministic ID fallback

### 7.3 Listing Detail

`GET /properties/:slug` must:

- return only public approved/published listings unless admin/owner context is added
- include all images ordered by cover, sort order, and created date
- include contact number/email fields
- preserve SEO fields used by listing pages

### 7.4 Owner Dashboard

Owner routes must enforce:

- valid JWT
- listing belongs to current user
- drafts can be edited
- submitted listings move to `pending_review`
- delete archives approved/published listings instead of hard deleting, matching current behavior
- image upload respects max image count, file size, and allowed extensions

### 7.5 Admin

Admin routes must enforce:

- valid JWT
- user role is `admin`
- approval requires image count unless global setting disables the requirement
- reject/unpublish must record admin note where provided
- bulk actions must write audit logs
- settings updates must persist to D1

### 7.6 Email

Initial Cloudflare migration can keep email provider as console/log mode.

Required:

- preserve email log tables
- preserve email template editing
- keep admin email screens functional

Future provider integration can be added after migration.

## 8. TanStack Start Frontend Migration

### 8.1 Design Preservation Rules

The TanStack UI must preserve:

- existing color palette and brand identity
- PropertyBikri logo placement
- ABCBangla24 footer logo/link
- off-white footer with black text
- mobile footer ordering
- SEO-focused header menu labels
- compact mobile header behavior
- default listing fallback image
- homepage featured listing layout
- listing cards and search filter ergonomics

Do not redesign the site during migration. Convert framework behavior first, then improve design later.

### 8.2 Route Mapping

Map Next.js app routes to TanStack file routes:

- `src/app/page.tsx` becomes `/`
- `src/app/properties/page.tsx` becomes `/properties`
- `src/app/properties/[slug]/page.tsx` becomes `/properties/$slug`
- `src/app/[seoSlug]/page.tsx` becomes `/$seoSlug`
- dashboard/admin route folders become equivalent protected TanStack routes
- `sitemap.ts` becomes a route handler returning XML
- `robots.ts` becomes a route handler returning text

### 8.3 Data Fetching

Use TanStack loaders for SEO-critical public pages:

- homepage featured listings
- properties search page
- listing detail page
- SEO landing pages
- sitemap

Use TanStack Query for client-heavy authenticated screens:

- owner dashboard
- listing editor
- image uploader
- admin listings
- admin inquiries
- admin email hub
- admin settings

### 8.4 Metadata

Preserve current SEO keyword strategy:

- global title: `Houses, Lands & Apartments For Sale in Dhaka | PropertyBikri`
- homepage H1 includes the primary phrase
- listing details generate type/location metadata
- category pages keep focused title/description/canonical
- SEO landing pages keep unique title, description, H1, body copy, internal links

TanStack implementation must support route-level head/meta output.

## 9. Cloudflare Configuration

### 9.1 `wrangler.jsonc`

Required configuration shape:

```jsonc
{
  "name": "propertybikri",
  "main": "./dist/_worker.js",
  "compatibility_date": "2026-08-10",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "propertybikri-prod",
      "database_id": "replace-with-cloudflare-d1-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "PROPERTY_IMAGES",
      "bucket_name": "propertybikri-property-images"
    }
  ],
  "vars": {
    "PUBLIC_SITE_URL": "https://propertybikri.com",
    "PUBLIC_API_URL": "https://api.propertybikri.com",
    "REAL_ESTATE_PUBLIC_PHONE": "+8801717-849009",
    "REAL_ESTATE_PUBLIC_EMAIL": "info@propertybikri.com",
    "REAL_ESTATE_SUPPORT_EMAIL": "support@propertybikri.com",
    "REAL_ESTATE_ADMIN_ALERT_EMAIL": "admin@propertybikri.com"
  }
}
```

Set secrets separately:

```bash
npx wrangler secret put JWT_SECRET
```

### 9.2 DNS

Preview first:

- keep existing VPS DNS live
- deploy Cloudflare preview under a temporary workers.dev or preview domain
- run all smoke tests

Production cutover:

- route `propertybikri.com` to Cloudflare app
- route `www.propertybikri.com` to Cloudflare app
- route `api.propertybikri.com` to Worker API
- keep old VPS online for rollback until at least 72 hours after cutover

## 10. Migration Phases

### Phase 1: Baseline Backup

- Pull latest `main`.
- Confirm current production DB checksum.
- Confirm current property image archive checksum.
- Export current SQLite to a dated backup.
- Export current image archive to a dated backup.
- Save sitemap URL count and listing count.

### Phase 2: Cloudflare Project Skeleton

- Create TanStack Start project/branch.
- Install Cloudflare Vite plugin and Wrangler.
- Configure D1/R2 bindings.
- Add environment typing.
- Add health route.
- Deploy preview hello-world app.

### Phase 3: UI Port

- Port layout, header, footer, globals, assets, property cards, search components, dashboard shell, admin shell.
- Preserve responsive behavior.
- Preserve SEO pages and static content pages.
- Run visual checks before wiring all mutations.

### Phase 4: API Port

- Implement D1 query helpers.
- Implement auth helpers.
- Implement public property search/detail.
- Implement owner listing CRUD.
- Implement R2 image upload/delete/list.
- Implement admin moderation.
- Implement inquiries and email logs.

### Phase 5: Data Import

- Import SQLite dump into preview D1.
- Upload images into preview R2.
- Run row count and object count verification.
- Fix schema/import issues before production import.

### Phase 6: Preview Smoke Test

- Deploy Cloudflare preview.
- Test all public pages.
- Test search pagination.
- Test listing detail image load.
- Test login/register.
- Test post-property flow.
- Test admin approval flow.
- Test sitemap and robots.

### Phase 7: Production Import And Cutover

- Freeze writes on old VPS during final import window.
- Take final DB backup.
- Take final image backup.
- Import final DB into production D1.
- Sync final image changes into production R2.
- Deploy production Worker.
- Switch DNS.
- Run live smoke tests.

### Phase 8: Rollback Window

- Keep old VPS services active.
- Keep old DB/assets untouched.
- If critical Cloudflare issue appears, switch DNS back to VPS.
- Record issue, fix in preview, retry cutover.

## 11. Smoke Test Matrix

Public:

- Homepage loads and has current H1.
- Header menu links load correct search pages.
- Footer logos load on desktop and mobile.
- Footer mobile phone/WhatsApp/Facebook alignment matches production.
- `/properties?purpose=sale` loads and paginates.
- `/properties?purpose=rent` loads and paginates.
- `/properties?property_type=apartment&purpose=sale` loads.
- `/properties?property_type=house&purpose=sale` loads.
- `/properties?property_type=land&purpose=sale` loads.
- `/properties?property_type=commercial&purpose=sale` loads.
- Listing detail page loads images or fallback image.
- Inquiry submission creates a D1 row.

SEO:

- homepage title and meta description match current target.
- listing detail title uses type/location.
- SEO landing page title/canonical/description render.
- `sitemap.xml` returns 200.
- sitemap has no duplicate URLs.
- `robots.txt` returns 200 and links sitemap.

Auth:

- existing admin can log in or reset password.
- existing customer can log in or reset password.
- invalid token returns 401.
- non-admin cannot access admin routes.

Owner dashboard:

- create draft listing.
- edit draft listing.
- upload image to R2.
- delete image from R2 and D1.
- submit listing for review.
- view inquiries.

Admin:

- view pending listings.
- approve listing.
- reject listing with note.
- unpublish listing with note.
- archive listing.
- bulk approve/reject/unpublish/archive.
- view users.
- update user role/status.
- view email logs.
- edit email templates.
- update site settings.

Performance:

- homepage TTFB acceptable from Cloudflare preview.
- listing search API returns fast for common filters.
- R2 image responses include cache headers.
- no large blocking client bundle regressions.

## 12. Rollback Plan

Rollback is DNS-based.

Before cutover:

- keep old VPS systemd services running
- keep old VPS DB and images unchanged
- keep old nginx config available
- keep previous GitHub branch and archive available

If Cloudflare production fails:

```bash
# In Cloudflare DNS, point:
# propertybikri.com -> old VPS
# www.propertybikri.com -> old VPS
# api.propertybikri.com -> old VPS
```

After DNS rollback:

- verify homepage
- verify API health
- verify sale/rent listing pages
- verify admin login
- document failed Cloudflare deploy version and issue

Do not destroy old VPS until Cloudflare has been stable for at least 72 hours.

## 13. Documentation To Update During Implementation

Update these docs as implementation proceeds:

- `real-estate-docs/06-operations/PROPERTYBIKRI_VPS_MIGRATION.md`
- `real-estate-docs/06-operations/BACKUP_AND_RECOVERY.md`
- `real-estate-docs/03-development/LOCAL_SETUP.md`
- `real-estate-docs/06-operations/RELEASE_CHECKLIST.md`
- this guide

Add a final Cloudflare operations guide after launch with:

- Cloudflare project IDs
- D1 database names and IDs
- R2 bucket names
- Worker names
- DNS records
- rollback DNS records
- deploy commands
- secret names
- backup/export commands

Do not commit raw production secrets.

## 14. Acceptance Checklist

The migration is ready for final DNS cutover only after all items are checked:

- Current SQLite export imported into D1 preview.
- D1 preview row counts match SQLite row counts.
- Current image archive uploaded into R2 preview.
- R2 preview object count matches local image file count.
- TanStack Start preview deploy passes.
- Worker API preview deploy passes.
- Public route smoke tests pass.
- Auth smoke tests pass.
- Owner dashboard smoke tests pass.
- Admin smoke tests pass.
- SEO/sitemap/robots checks pass.
- Mobile visual checks pass.
- Production D1 import tested.
- Production R2 sync tested.
- Rollback DNS target confirmed.
- Old VPS backup confirmed.
- Final write-freeze window selected.

## 15. Implementation Default Decisions

Use these defaults unless a future technical blocker forces a documented change:

- Use TanStack Start as the full frontend framework.
- Use Workers API handlers instead of FastAPI in Cloudflare.
- Use D1 directly through `env.DB.prepare()` for v1 migration.
- Add a query helper layer, but do not add a heavy ORM until after parity.
- Use R2 for all listing images and future uploads.
- Serve images through `/images/*` compatibility route.
- Preserve existing API response shapes during the migration.
- Preserve existing public URLs and SEO slugs.
- Keep old VPS online for rollback during the launch window.
