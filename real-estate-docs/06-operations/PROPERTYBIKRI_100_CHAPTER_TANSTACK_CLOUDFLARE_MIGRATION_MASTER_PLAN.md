# PropertyBikri 100-Chapter TanStack Start and Cloudflare Migration Master Plan

Status: implementation-ready master plan  
Workspace: `C:\realestatesite`  
Plan-only document: this file does not authorize production changes  
Migration order: database and backend first, data and media second, frontend last  
Target: TanStack Start + Cloudflare Workers + D1 + R2 + Resend

## Executive mandate

PropertyBikri will move from Next.js 14, FastAPI, SQLAlchemy, SQLite, and VPS-local image storage to one TanStack Start application deployed on Cloudflare Workers. The Worker will serve the website, server-rendered routes, API handlers, and the `/images/*` compatibility route. Cloudflare D1 will become the canonical relational database, Cloudflare R2 will hold property images, and Resend will deliver transactional email through HTTP.

The migration must preserve all production property listings, users, images, inquiries, audit history, email records, templates, settings, static pages, SEO landing pages, public URLs, listing slugs, integer IDs, business-contact rules, owner privacy, dashboard behavior, and admin operations. “Posts” in this plan means property listings plus existing static and SEO content; it does not introduce a blog CMS.

The checked-in SQLite database and August 2026 image archive are rehearsal fixtures. The final production import must come from a fresh, write-frozen VPS export. No frontend migration begins until the Worker backend passes its preview parity gate. No DNS cutover occurs until D1, R2, API, authentication, email, frontend, SEO, and lifecycle acceptance checks pass.

## Locked architecture and decisions

- Deploy one TanStack Start Worker, with `propertybikri.com`, `www.propertybikri.com`, and `api.propertybikri.com` routed to it.
- Preserve current `/auth/*`, `/properties*`, `/admin/*`, `/images/*`, static, dashboard, sitemap, robots, and SEO URLs.
- Use D1 prepared statements behind a typed repository layer; do not add a heavy ORM for the parity migration.
- Import canonical business tables only. Do not promote `*_v2`, `migration_state`, `backfill_checkpoints`, or SQLite internal tables.
- Preserve current integer IDs and listing slugs. New public IDs may be added later, but cannot replace compatibility identifiers during this migration.
- Preserve seven compatible PBKDF2-SHA256 password hashes. Force a secure reset for the one incompatible account found in the rehearsal database.
- Reconcile archived images deterministically. Attach an unlinked file only when its listing-folder ownership is valid; quarantine true orphans with a manifest.
- Keep static and SEO content as typed, version-controlled application content rather than inventing a database CMS.
- Use Resend for production transactional email and retain a console/log provider for local development.
- Use a short maintenance window for the final data export/import. Do not build dual-write or change-data-capture infrastructure.
- Keep the VPS available for rollback for at least 72 hours after cutover.

## Standard chapter completion record

Every implementation chapter must be closed with: responsible operator, date, commands run, input checksum or release ID, outputs produced, tests performed, pass/fail result, exceptions, rollback state, and links to evidence. A chapter is not complete when work merely compiles; its acceptance gate must pass.

---

## Part I — Governance and verified baseline

## Chapter 01 — Mission, scope, and finish line

Define the finish line as functional and data parity on Cloudflare, not a visual redesign. In scope are all canonical data, listing/media workflows, auth, owner dashboard, admin tools, inquiries, settings, email templates/logs, transactional mail, static pages, SEO routes, sitemap, robots, and current domains. Out of scope are billing, a blog CMS, agent marketplace, CRM automation, advanced maps, mobile apps, and unrelated product expansion.

**Gate:** stakeholders approve the scope statement and acknowledge that framework conversion precedes design improvements.

## Chapter 02 — Workspace and safety boundary

Work only inside `C:\realestatesite`. Treat the VPS, Cloudflare production resources, DNS, live database, and live media as protected systems. Never edit the reference repository or commit secrets. Never delete or overwrite the VPS database or image tree. All exports receive timestamps and SHA-256 manifests. Destructive commands must target explicit validated paths and require a separate authorized execution task.

**Gate:** clean worktree recorded; target folders and protected systems listed in the migration log.

## Chapter 03 — Current system evidence

Record versions and paths for Next.js, React, FastAPI, SQLAlchemy, Python, Node, SQLite, systemd, nginx, database, images, environment files, domains, and certificates. Export the FastAPI OpenAPI document and inventory frontend routes. Capture Worker-incompatible dependencies and all environment variable names without recording secret values.

**Output:** `baseline-system-inventory.json` and human-readable evidence appendix.

## Chapter 04 — Target system topology

Document one Worker receiving all three domains. Route UI requests through TanStack Start SSR, API requests through typed Worker handlers, SQL through `env.DB`, and media through `env.PROPERTY_IMAGES`. Use Resend from server-only code. Preview and production use separate Workers, D1 databases, R2 buckets, secrets, and hostnames.

**Gate:** architecture diagram shows no runtime dependency on FastAPI, SQLAlchemy, Node filesystem storage, or the VPS after cutover.

## Chapter 05 — Non-negotiable product invariants

Public queries return approved listings only. Public payloads never reveal owner email, owner phone, owner user ID, private address, admin note, reset tokens, or audit internals. Owners operate only on their records. Admin actions require an active admin. Rejection requires a note. Approval requires a business phone and the configured image rule. Every lifecycle mutation writes an audit row.

**Gate:** each invariant maps to at least one automated test.

## Chapter 06 — Sources of truth

Use repository source code and contracts to define behavior. Use the checked-in database/archive to rehearse. Use a final live, write-frozen SQLite backup and media export as production data truth. When documents conflict with runtime behavior, record the discrepancy and choose an explicit compatibility behavior before implementation.

**Gate:** source-precedence table is signed off.

## Chapter 07 — Documentation drift resolution

Catalog documents that still describe implementation as unconfirmed, omit current routes, describe old gaps, or conflict with PropertyBikri production. Mark each as current, historical, superseded, or requiring update. Do not silently delete historical plans. The master rules, API contracts, schema contracts, storage contracts, route map, setup, release, backup, and rollback docs must match the new stack by launch.

**Gate:** drift register has an owner and destination document for every conflict.

## Chapter 08 — Environment matrix

Define local, preview, and production environments. Local uses Wrangler local D1/R2 emulation and console email. Preview uses isolated remote D1/R2 and a test Resend sender or suppressed recipients. Production uses final bindings, verified PropertyBikri sender domain, and custom routes. Never share preview and production databases or buckets.

**Output:** binding, hostname, and secret-name matrix without secret values.

## Chapter 09 — Roles and approvals

Assign database exporter, D1 importer, R2 operator, backend implementer, frontend implementer, QA owner, security reviewer, DNS operator, and cutover authority. The person operating DNS must have the verified old-VPS rollback targets before cutover. User approval is required for production writes, secret configuration, Cloudflare resource creation, and DNS changes.

**Gate:** no production phase has an unassigned accountable operator.

## Chapter 10 — Master stage gates

Establish gates: baseline, schema, rehearsal export, D1 parity, R2 parity, backend parity, email parity, frontend parity, preview acceptance, final import, DNS cutover, 72-hour stability, and retirement. A failed gate blocks later stages; it does not become a deferred launch issue.

**Output:** one checklist with evidence links and explicit stop conditions.

---

## Part II — Database discovery and D1 design

## Chapter 11 — Safe SQLite acquisition

Take an online SQLite backup from the live application using SQLite backup semantics, not a raw copy during writes. Record source path, file size, SQLite integrity result, timestamp, application release, and SHA-256. Store the backup outside the served application and retain an immutable copy through the rollback window.

**Gate:** `PRAGMA integrity_check` returns `ok` and checksum verification succeeds twice.

## Chapter 12 — Complete database inventory

List every table, index, trigger, view, column, constraint, and row count. Profile canonical and mirror tables separately. Capture counts grouped by listing status, purpose, type, owner, inquiry status, image listing, email state, and user role. Repeat this inventory during rehearsal and final export.

**Output:** machine-readable inventory used by later verification scripts.

## Chapter 13 — Canonical table selection

Import `users`, `password_reset_tokens`, `property_listings`, `property_images`, `property_inquiries`, `property_audit_logs`, `email_logs`, `email_attachments`, `email_templates`, `security_events`, and `site_settings`. Exclude `*_v2`, migration state, checkpoint, SQLite internal, and obsolete reference tables. If the live inventory reveals an additional active business table, pause and amend schema/contracts before import.

**Gate:** canonical allowlist and exclusion report contain every discovered table.

## Chapter 14 — Relationship and ownership audit

Validate every foreign-key relationship even if SQLite did not enforce it historically. Detect listings without users, images/inquiries/audits without listings, audit actors without users, settings duplicates, attachments without email logs, and invalid admin references. Never silently delete or reassign an orphan.

**Gate:** zero unexplained relationship violations; approved exceptions have deterministic repair SQL.

## Chapter 15 — D1 type and naming rules

Use `INTEGER PRIMARY KEY` for preserved IDs, `TEXT` for ISO-8601 UTC timestamps and JSON, `INTEGER` for booleans, and integer minor units or carefully verified numeric text for money where precision matters. Keep current snake_case names. Add explicit `NOT NULL`, defaults, checks, and foreign keys rather than depending on application validation alone.

**Gate:** schema conversion test round-trips representative values without precision or timezone loss.

## Chapter 16 — Users schema

Preserve ID, normalized lowercase email, password hash, role, full name, active state, and created time. Keep `client` and `admin` as allowed roles. Add an optional `auth_version` integer for token invalidation and `password_reset_required` boolean for the incompatible account. Do not expose either internal field in public responses.

**Gate:** user count and normalized-email uniqueness match the approved source report.

## Chapter 17 — Password compatibility

Implement Passlib-compatible PBKDF2-SHA256 parsing with algorithm, round count, salt, and digest verification using Web Crypto. Test known fixtures without logging passwords or hashes. Mark only nonconforming hashes for reset. On successful login, optionally rehash to a stronger approved round count while preserving compatibility.

**Gate:** all compatible fixture accounts authenticate; malformed hashes fail closed; incompatible account receives reset-required behavior.

## Chapter 18 — Password reset records

Store only hashes of newly issued reset tokens, plus user/email reference, expiry, used time, request metadata, and created time. Invalidate previous active tokens when a new one is issued. Final cutover invalidates unsafe legacy plaintext tokens. Responses must not reveal whether an email exists.

**Gate:** expiry, one-time use, replay rejection, enumeration prevention, and password change tests pass.

## Chapter 19 — Listings schema

Map every implemented listing field: identity, owner, slug, title, description, purpose, type/subtype, lifecycle status, price fields, currency/period, all location fields, map coordinates, room/floor/parking facts, building and land sizes, plot/facing/handover/furnishing fields, JSON amenities/nearby places, owner/admin notes, featured state, approver, lifecycle timestamps, and creation/update timestamps.

**Gate:** field-by-field comparison passes for every rehearsal listing and sampled final records.

## Chapter 20 — Listing lifecycle constraints

Allow `draft`, `pending_review`, `approved`, `rejected`, `unpublished`, and `archived`. Public visibility equals approved only. Owner edits are limited to current contract rules; editing an approved listing returns it to review. Admin approve/reject/unpublish/archive operations set their timestamps consistently. Every mutation records prior status and next status.

**Gate:** state-transition matrix is implemented and invalid transitions return a deterministic 400/409.

## Chapter 21 — Property image metadata

Preserve image ID, listing ID, stable R2 key, public compatibility URL, alt text, sort order, cover flag, uploader, and creation time. Enforce at most one cover per listing in application logic and verification. Store object keys independently from domain URLs so future domain changes do not rewrite storage identity.

**Gate:** each listing’s ordered gallery and cover selection match the approved manifest.

## Chapter 22 — Inquiry schema

Preserve listing, name, phone, optional email/message, contact preference, source page, privacy-safe IP hash, user agent, status, assigned admin, and timestamps. Allow only `new`, `contacted`, `closed`, and `spam`. Define retention and access: admins see all; owners see only contract-approved fields for their listings.

**Gate:** owner isolation and public write validation tests pass.

## Chapter 23 — Audit schema

Audit rows are append-only. Preserve listing, actor, action, prior/next status, note, metadata JSON, and time. New bulk operations create one row per listing. Sensitive request details and secrets are forbidden in metadata. Application code cannot update or delete audit history through normal APIs.

**Gate:** lifecycle tests verify exact audit row creation.

## Chapter 24 — Email data schema

Preserve historical logs, templates, and attachments. Extend logs with provider, provider message ID, idempotency key, attempt count, delivery state, last error, and updated time. Templates retain stable template keys and editable subject/body. Attachment binaries move to R2 if any exist; metadata remains in D1.

**Gate:** historical rows remain readable and new Resend events update without duplicates.

## Chapter 25 — Security events

Record failed logins, inactive-user attempts, reset requests/uses, invalid JWTs where appropriate, rate-limit blocks, upload rejections, admin role/status changes, webhook signature failures, and migration security exceptions. Store privacy-minimized metadata and define retention.

**Gate:** security tests generate the expected events without secrets or raw passwords.

## Chapter 26 — Site settings

Migrate global contact number and every active setting. Create an allowlist of admin-editable keys and distinguish public settings from server-only controls. Environment values provide safe bootstrap defaults, but database values retain intended admin configurability. Secrets must never enter this table.

**Gate:** public contact precedence and protected-setting rejection tests pass.

## Chapter 27 — Foreign-key and deletion policy

Restrict deletion of users with business history. Archive listings that have been submitted or published. Allow permanent deletion only for eligible drafts and their images under current contract. Cascade temporary reset records only where safe. Never delete inquiries, audits, or email history as a side effect of ordinary listing operations.

**Gate:** deletion tests prove no unintended historical loss.

## Chapter 28 — D1 indexes

Index listing slug; owner/update; status/created; status/purpose/type; status/city/area; featured/status; price; size; land size; images by listing/cover/sort; inquiries by status/update and listing/create; audits by listing/create; email by recipient/create and provider ID; users by normalized email. Verify common query plans.

**Gate:** preview query plans use expected indexes for search and dashboards.

## Chapter 29 — Versioned migrations

Store numbered SQL migrations in source control. Separate schema, indexes, seed templates/settings, and later changes. Use Wrangler migration commands for local and preview before production. Never edit an already-applied migration; add a new forward migration. Document that D1 rollback normally means code rollback plus a tested forward repair or database restore.

**Gate:** empty local database reaches current schema solely by applying migrations.

## Chapter 30 — Deterministic export converter

Build a script that reads the source SQLite database read-only and emits D1-compatible SQL and JSON manifests. Remove outer transaction wrappers and unsupported objects, preserve insert order and IDs, batch statements below platform limits, escape text safely, normalize timestamps, validate JSON, and stop on unapproved data errors.

**Gate:** two runs against the same input produce identical checksums.

---

## Part III — Data, listings, content, and R2

## Chapter 31 — Data profiling

Measure nulls, duplicates, enum violations, invalid timestamps, malformed JSON, extreme numeric values, missing required fields, and relationship failures. Produce severity levels: blocker, deterministic repair, accepted historical exception, and warning. Repairs must be scripts with before/after evidence, never manual undocumented edits.

**Gate:** zero unresolved blockers before preview import.

## Chapter 32 — User validation

Check normalized email uniqueness, role validity, active admin availability, password format, full-name length, and creation time. Identify the single rehearsal incompatible password without exposing it. Confirm at least one production admin has a tested reset path before maintenance begins.

**Gate:** admin access recovery procedure is proven in preview.

## Chapter 33 — Listing validation

Validate each listing’s owner, slug, status, purpose, type, title, description, location, price behavior, currency, JSON, lifecycle timestamps, and approval consistency. Approved listings missing required media or business facts are reported, not automatically hidden. Compare counts by status/purpose/type before and after import.

**Gate:** every source listing is imported or appears in an approved exception register.

## Chapter 34 — Slug and URL preservation

Treat every current slug as immutable compatibility data. Detect duplicates before D1 import. New slugs use normalized title plus collision-resistant suffix. Never change existing slugs to improve SEO during migration. Maintain canonical URLs and verify redirects only for already documented aliases.

**Gate:** all captured production listing URLs resolve to the same listing in preview.

## Chapter 35 — Ownership reconciliation

Produce listing-to-user counts and detect imported/demo ownership anomalies. Missing owners block import unless an explicit recovery user and documented reassignment are approved. Do not assign listings to the default admin merely to satisfy a constraint.

**Gate:** every listing has an accountable existing owner.

## Chapter 36 — Image-row audit

Compare every image row’s listing, path, URL, filename, extension, cover flag, and physical existence. Detect duplicate rows pointing to one object and explain whether duplicates represent intentional reuse or corrupt metadata. Preserve database IDs while normalizing storage keys.

**Gate:** no referenced object is missing from the final source asset set.

## Chapter 37 — Unlinked image reconciliation

For files absent from image rows, infer ownership only from a valid `property-images/{listingId}/` folder whose listing exists. Deduplicate by checksum. Generate proposed image rows with deterministic ordering and cover rules; require review before attachment. Files with invalid folders, absent listings, or ambiguous duplicates enter a timestamped quarantine manifest and remain recoverable.

**Gate:** attached, duplicate, and quarantined totals add exactly to the source-file total.

## Chapter 38 — R2 key contract

Use `property-images/{listingId}/{safeFilename}`. Reject path traversal, control characters, empty names, and unsupported extensions. Preserve existing filenames where safe to keep URLs stable. Store MIME, checksum, cache-control, original size, and source manifest ID as metadata where useful.

**Gate:** key-generation fixtures cover Unicode, spaces, duplicates, and hostile filenames.

## Chapter 39 — R2 manifest

The manifest contains source relative path, listing ID, database image ID if present, R2 key, byte size, SHA-256, MIME, cover flag, sort order, reconciliation disposition, and upload status. It is immutable per migration run and receives its own checksum.

**Gate:** database rows, attached extras, and quarantine are completely represented.

## Chapter 40 — R2 bulk uploader

Implement idempotent bounded-parallel uploads with retry/backoff, content metadata, checkpointing, and resume. Skip an existing object only after size/checksum agreement. Treat conflicting content at the same key as a blocker. Use preview bucket first and never run against production without explicit authorization.

**Gate:** uploaded object count and checksum manifest match the approved input.

## Chapter 41 — Image compatibility responses

Serve `/images/{listingId}/{filename}` from R2. Validate the path, fetch the exact key, return 404 without leaking bucket details, copy content headers, support ETag/conditional requests, and use long public caching for immutable names. Do not expose bucket credentials or unrestricted listing APIs.

**Gate:** all database public image URLs return correct bytes in preview.

## Chapter 42 — New uploads

Require an authenticated owner and listing ownership. Enforce editable status, image count, request/body size, extension allowlist, MIME sniffing, and safe filename generation. Write R2 first to a final deterministic key, then D1; delete the object if D1 fails. Audit upload events without storing binary data in D1.

**Gate:** valid uploads succeed and hostile, oversized, spoofed, cross-owner, and over-limit uploads fail cleanly.

## Chapter 43 — Delete and cover behavior

Confirm ownership before deletion. Remove the D1 row and R2 object using a recoverable sequence with compensating repair records on partial failure. When deleting a cover, select the next ordered image or leave no cover deterministically. Do not let a failed object delete corrupt gallery state silently.

**Gate:** deletion and failure-injection tests leave D1/R2 consistent or repairable.

## Chapter 44 — Static-page inventory

Inventory and preserve `/about`, `/advertise`, `/contact`, `/careers`, `/privacy`, `/terms`, `/cookies`, `/sitemap`, homepage, auth entry pages, and any additional current static route found during final baseline capture. Record title, description, headings, links, structured data, indexability, and responsive screenshots.

**Gate:** route inventory has no unexplained omissions.

## Chapter 45 — SEO landing inventory

Expand generated SEO definitions into an explicit manifest containing slug, title, description, canonical, H1, intro, content sections, FAQs, related links, and listing query. Preserve broad Dhaka, apartment, house, land, commercial, and area pages exactly unless a separate SEO change is approved.

**Gate:** every current landing URL exists once in the manifest and sitemap.

## Chapter 46 — Homepage content inventory

Capture hero copy and image, search defaults, featured/latest sections, property-type cards, city cards, promotional sections, CTAs, partner/brand assets, and all links. Record empty and error behavior when APIs fail. Treat visual screenshots as parity evidence, not as assets to copy blindly.

**Gate:** desktop and mobile baselines are complete at agreed viewports.

## Chapter 47 — Navigation and footer

Preserve menu labels, buy/rent/advertise/post-property behavior, authenticated role destinations, PropertyBikri branding, ABCBangla24 footer link/logo, business address, phone, WhatsApp, Facebook, legal links, and mobile ordering. All internal links must use canonical routes.

**Gate:** link crawler and mobile navigation smoke pass.

## Chapter 48 — Content representation

Keep static and SEO content in typed TypeScript modules imported by TanStack routes. Define types for metadata, content sections, FAQs, related links, and listing queries. D1 remains business-data storage; do not create a content/post table or admin CMS in this migration.

**Gate:** content builds without runtime database dependency and remains editable in source control.

## Chapter 49 — Sitemap contract

Generate absolute canonical URLs for public static pages, every SEO landing page, and every approved listing. Deduplicate, exclude dashboards/admin/auth/query permutations and non-approved listings, use stable last-modified values, and ensure robots points at the production sitemap.

**Gate:** XML parses, URLs are unique, sampled URLs return 200, and private routes are absent.

## Chapter 50 — Data acceptance report

Combine database counts, grouped counts, relationship results, listing identifiers, image reconciliation, R2 manifest, content routes, and checksums. State every approved exception. This report becomes the comparison baseline for preview and final production import.

**Gate:** QA and migration operator sign the report before backend implementation consumes imported data.

---

## Part IV — Worker backend foundation

## Chapter 51 — TanStack/Worker skeleton

Create the migration implementation in an isolated folder or branch while retaining the current app. Use TanStack Start, Vite, the Cloudflare Vite plugin, Wrangler, React, TypeScript, and generated Cloudflare binding types. Configure build, typecheck, test, preview, deploy, and type-generation scripts. The server entry uses the current official TanStack Cloudflare pattern.

**Gate:** hello-world SSR, API health, local D1 binding, and local R2 binding work.

## Chapter 52 — Wrangler resources

Define distinct preview/production Worker names, D1 databases, R2 buckets, routes, compatibility date/flags, observability, and nonsecret variables. Generate binding types. Do not hardcode resource IDs in shared examples without clear environment separation.

**Gate:** `wrangler dev` and preview deployment bind only the intended nonproduction resources.

## Chapter 53 — Environment and secrets

Define `DB`, `PROPERTY_IMAGES`, `JWT_SECRET`, JWT issuer/audience, site/API URLs, public contact values, Resend key/webhook secret/senders, environment name, release ID, rate limits, image limits, and approval policy. Read request-time bindings safely. Client bundles receive only explicitly public values.

**Gate:** secret scan and bundle inspection find no server secret.

## Chapter 54 — Request pipeline

Attach or generate `X-Request-ID`, create structured logs, normalize CORS for approved origins, add security headers, map expected errors, and hide internal stack traces. Split public, authenticated, owner, admin, webhook, and image middleware paths. Logs include release/environment but not tokens or private payloads.

**Gate:** error and header contract tests pass across route groups.

## Chapter 55 — D1 repository layer

Implement small domain repositories for users, auth, listings, images, inquiries, audits, email, templates, and settings. Use parameterized prepared statements only. Centralize row decoding, booleans, dates, JSON, pagination, and not-found behavior. Use `DB.batch()` or explicit transaction facilities where atomic multi-write behavior is supported and tested.

**Gate:** repositories pass local and remote-preview integration tests.

## Chapter 56 — API contract and errors

Preserve current successful JSON shapes, query aliases, bearer authentication, and endpoint paths. Standardize errors with `detail`, request ID, and optional safe field errors. Use 400 for invalid state/input, 401 invalid auth, 403 role/ownership, 404 hidden/not found, 409 conflicts, 413 size, 422 schema, 429 rate limit, and 500 internal failure.

**Gate:** compatibility fixtures cover success and error behavior.

## Chapter 57 — JWT implementation

Verify HS256 through Web Crypto-compatible libraries or code. Preserve `sub` compatibility while adding issuer, audience, issued-at, expiry, token version, and a unique token ID for new tokens. Reject missing, expired, wrong-algorithm, wrong-environment, inactive-user, and version-invalid tokens. Document secret rotation with dual verification during a bounded transition.

**Gate:** cryptographic and negative-token tests pass.

## Chapter 58 — Authorization middleware

Create helpers for optional user, required active user, required listing owner, and required active admin. Resolve the user from D1 on protected requests so deactivation takes effect immediately. Admin UI checks are convenience only; Worker enforcement is authoritative.

**Gate:** cross-owner and client-to-admin attempts consistently return 403/404 as designed.

## Chapter 59 — Rate limits

Apply Cloudflare-native rate limiting or an approved Worker-compatible limiter to login, registration, resets, inquiries, uploads, admin email, and admin writes. Keys use privacy-safe user/IP scopes. Return `Retry-After`. Fail closed for sensitive routes if the limiter is unavailable, while public reads remain available when safe.

**Gate:** burst, reset-window, authenticated-key, and bypass tests pass.

## Chapter 60 — Health and readiness

Keep `/health` and `/health/email`. Add safe readiness checks for D1 queryability, R2 binding, email configuration, environment, and release ID without exposing secrets or private resource identifiers. Separate liveness from dependency readiness so monitoring can diagnose failures.

**Gate:** monitoring can distinguish Worker, D1, R2, and email failure modes.

---

## Part V — Complete Worker API migration

## Chapter 61 — Registration

Port JSON email/password/full-name registration. Normalize email, validate password, prevent duplicates, hash with the approved PBKDF2 policy, create a client user, log security/audit context, send welcome email, and return bearer token compatibility. Never allow public role selection.

**Gate:** duplicate, weak-password, malformed-email, rate-limit, email-failure, and success tests pass.

## Chapter 62 — Login

Port JSON login, compatible hash verification, inactive-user block, failure rate limits, and token issuance. The incompatible account receives a generic reset-required path without disclosing hash details. Successful verification may upgrade hash parameters.

**Gate:** seven-compatible/one-reset rehearsal behavior and admin/client redirects pass.

## Chapter 63 — Current user and profile

Port `GET /auth/me` and `PATCH /auth/me`. Return only the established user contract. Validate name length and reject role/active/password manipulation through profile input. Record meaningful account changes.

**Gate:** active users update themselves; inactive or malicious requests fail.

## Chapter 64 — Password reset API

Port request, validation, and confirmation with generic request responses, hashed tokens, bounded expiry, one-time use, password policy, token-version increment, security events, and Resend delivery. Never return tokens outside controlled local test mode.

**Gate:** full reset lifecycle and replay/expiry tests pass.

## Chapter 65 — Global contact

Port `/properties/global-contact`. Read the allowlisted D1 setting first and environment fallback second. Return the existing `contact_number` shape. Cache briefly if desired but invalidate or bypass after admin setting updates.

**Gate:** database value, fallback, update, and empty-value behavior match policy.

## Chapter 66 — Public search

Port `GET /properties` with keyword, purpose/listing_purpose, property_type/type, location, price, bedroom, bathroom, size, land size, amenities, price visibility, sort, page, and page size. Enforce approved status internally. Return items, page, page_size, total, business contact, cover URL, and image count.

**Gate:** every supported filter/alias and combined-filter fixture matches FastAPI semantics.

## Chapter 67 — Search performance

Eliminate current per-listing cover/count queries. Fetch listing rows and media summaries through a bounded query strategy tested against D1. Ensure featured ordering has deterministic created-time and ID fallbacks. Cap page size and validate query plans.

**Gate:** no query count grows linearly per returned listing; preview latency meets the recorded budget.

## Chapter 68 — Public detail

Port `GET /properties/{slug}`. Return 404 for non-approved records without existence leakage. Include public listing facts, ordered images, business contact, and SEO-required timestamps. Exclude all owner/admin-private fields.

**Gate:** public privacy snapshot and gallery ordering pass for every status class.

## Chapter 69 — Public inquiries

Port inquiry creation for approved listings only. Validate name, phone, optional email/message, contact method, and payload lengths. Rate-limit abuse, store privacy-safe request context, create the D1 row once, send admin and optional visitor emails idempotently, and return a stable success shape.

**Gate:** duplicate/retry, non-approved, spam-sized, invalid, and success cases pass.

## Chapter 70 — Owner summary

Port `/properties/me-summary` with total/status counts, needs-action calculation, five most recently updated listings, owner-safe fields, admin feedback where allowed, and stable `next_action` values.

**Gate:** results include only the authenticated owner’s data.

## Chapter 71 — Owner list and detail

Port `/properties/me`, `/properties/me/{id}`, pagination, status filter, timestamps, feedback, and next action. Query by owner and ID in the same statement to avoid existence leakage. Preserve established response fields.

**Gate:** two-owner isolation suite passes.

## Chapter 72 — Create listing

Validate the complete listing payload, purpose/type-specific rules, price mode, location, and lengths. Generate a stable collision-safe slug, insert draft, and append `created` audit row. Reject admin use through owner routes if current product policy redirects admins.

**Gate:** property-type fixtures and concurrent slug generation pass.

## Chapter 73 — Update listing

Allow only the statuses permitted by current policy. Validate all fields, preserve immutable ownership/ID, and return approved edits to pending review. Use `updated_at` or an explicit version for optimistic conflict detection. Write an audit row containing status transition but no leaked private payload.

**Gate:** invalid-state, stale-write, cross-owner, and approved-resubmission cases pass.

## Chapter 74 — Submit listing

Require title, description, location, valid price behavior, land size where applicable, and at least one image when configured. Move eligible records to pending review, create audit, and send owner/admin notifications. Repeated submit on the resulting state must not duplicate effects.

**Gate:** completeness matrix and idempotency tests pass.

## Chapter 75 — Delete/archive listing

Match current semantics: eligible drafts may be deleted safely; reviewed/published records are archived instead of erased. Decide image cleanup from the explicit deletion policy, not implicit database cascades. Keep inquiries/audits/history.

**Gate:** each listing state produces the documented result with no history loss.

## Chapter 76 — Owner image endpoints

Port list, upload, and delete endpoints with established paths and response shapes. Integrate R2 rules from Chapters 42–43. Return ordered images and safe public URLs. Do not accept arbitrary remote public URLs for ordinary production uploads.

**Gate:** browser multipart flow and direct API tests pass.

## Chapter 77 — Owner inquiries

Port `/properties/me/inquiries`, joining inquiries only through listings owned by the authenticated user. Preserve the fields currently intended for owners and exclude assignment/internal metadata. Sort newest first and add pagination if production volume requires it without breaking the base response contract.

**Gate:** owners cannot infer or access inquiries for other listings.

## Chapter 78 — Admin listings

Port list, stats, recent audits, and detail with current filters and pagination. Admin detail includes owner, complete listing, ordered images, and audit history. Statistics use consistent definitions and indexed queries.

**Gate:** counts match direct D1 verification and list filters.

## Chapter 79 — Admin lifecycle actions

Port approve, reject, unpublish, and archive. Approval checks business phone, image requirement, and valid state. Rejection requires a note. Each action updates timestamps, creates audit, and sends the correct owner email. Mutations use atomic or compensating behavior.

**Gate:** transition, notification, audit, authorization, and repeated-action tests pass.

## Chapter 80 — Bulk moderation

Port bulk approve/reject/unpublish/archive. Validate bounded unique ID lists, process each listing under the same rules as individual actions, write one audit per successful item, and return per-item success/failure plus aggregate counts. A failure must never be hidden behind a single success count.

**Gate:** mixed-validity and retry tests prove deterministic partial results.

## Chapter 81 — Admin users and settings

Port user list/update and settings list/update. Validate role/active/name changes, prevent accidental removal of the last active admin, increment auth version when access changes, record security events, and allow only approved setting keys. Protect secret-like keys.

**Gate:** last-admin, deactivation, role escalation, protected-setting, and success tests pass.

## Chapter 82 — Admin inquiries and email hub

Port inquiry list/detail/status actions; email logs/content/user history; send; stats; templates; and settings UI APIs. Validate statuses and template fields. Admin composer uses Resend idempotency and rate limits. Historical console logs remain readable.

**Gate:** all existing admin screens can operate solely through the Worker API.

---

## Part VI — Resend and backend acceptance

## Chapter 83 — Resend adapter

Create an email provider interface with console and Resend implementations. The Resend adapter uses server-only API credentials, verified PropertyBikri sender identities, request timeouts, idempotency keys, and safe error mapping. Never make frontend calls directly to Resend.

**Gate:** local console and preview Resend modes pass the same provider contract tests.

## Chapter 84 — Templates and variables

Preserve the ten current template keys and define an allowlist of variables for each. Validate templates when saved, escape unsafe interpolation, detect missing variables, and retain a source-controlled fallback. Cover welcome, reset, submit owner/admin, approve, reject, unpublish, inquiry admin/visitor, and custom admin mail.

**Gate:** every template renders from representative payloads without unresolved placeholders.

## Chapter 85 — Delivery states

Use explicit states such as queued, accepted/sent, delivered, bounced, complained, retrying, failed, and suppressed. Record provider message ID and attempts. Application success should distinguish “business row created but email delayed” from a failed business mutation; do not duplicate the mutation during email retry.

**Gate:** state-transition tests cover synchronous and webhook updates.

## Chapter 86 — Resend webhooks

Add a dedicated endpoint, verify the provider signature against the raw request, reject stale/invalid requests, deduplicate events, map message IDs, and update delivery state. Log security failures without persisting full sensitive payloads. Return retry-safe status codes.

**Gate:** signed fixtures, duplicates, reordering, unknown messages, and invalid signatures pass.

## Chapter 87 — Email retries

Retry transient network, timeout, and provider 5xx/429 failures with bounded exponential backoff. Do not retry invalid recipients or permanent provider errors indefinitely. Expose safe admin visibility and an authorized manual retry using the same idempotency identity.

**Gate:** failure-injection tests produce no duplicate accepted email.

## Chapter 88 — API parity suite

Run the FastAPI and Worker implementations against equivalent fixtures. Compare status codes, JSON keys, filters, pagination, ordering, privacy, state transitions, and errors while normalizing request IDs and timestamps. Record intentional differences explicitly.

**Gate:** zero unexplained contract differences.

## Chapter 89 — Security suite

Test owner-data leakage, SQL injection, JWT manipulation, inactive accounts, role escalation, IDOR, upload traversal/MIME spoofing, excessive payloads, reset replay, email abuse, webhook forgery, CORS, security headers, rate limits, and log redaction.

**Gate:** no high/critical finding and all privacy invariants pass.

## Chapter 90 — Backend preview gate

Deploy Worker backend behavior to preview with imported rehearsal D1/R2 data. Run health, all API tests, existing-user auth, forced reset, listing lifecycle, image lifecycle, inquiry, moderation, settings, email, row-count, checksum, and latency checks. Freeze backend interfaces after this gate except for blocker fixes.

**Gate:** signed backend acceptance report; only then begin frontend port.

---

## Part VII — TanStack frontend migration

## Chapter 91 — Route architecture

Map Next.js routes to TanStack file routes: root, properties search/detail, dynamic SEO slug, auth, dashboard, admin, static pages, sitemap XML, robots text, and API/server handlers. Define route specificity so dynamic SEO slugs never swallow known routes. Generate and inspect the route tree.

**Gate:** route-manifest comparison accounts for every current URL.

## Chapter 92 — Root layout and design system

Port global CSS, Tailwind tokens, Geist/local fonts, metadata defaults, navbar, footer, skeletons, icons, logos, and fallback images. Use TanStack head/meta APIs and Cloudflare-safe asset handling. Preserve current brand, spacing, colors, mobile header/footer, and reduced-motion behavior; do not redesign.

**Gate:** root shell visual comparisons pass at agreed viewports.

## Chapter 93 — Homepage

Use a server loader for featured/latest listings and retain safe empty/error fallbacks. Port hero search, buy/rent toggle, location/type/budget/bedroom inputs, cards, cities, property categories, promotional content, insights, and post-property CTA. URLs produced by controls must match backend query aliases canonically.

**Gate:** SSR HTML, hydration, search navigation, images, and visual parity pass.

## Chapter 94 — Search and detail

Port search filters into URL state, responsive sidebar/drawer, sorting, grid/list, pagination, cards, loading, empty, and error states. Port detail SSR loader, generated metadata, gallery, facts, description, schema data, business contact reveal, inquiry form, and fallback image. Preserve approved-only 404 behavior.

**Gate:** representative sale/rent/type/location/filter/detail flows pass on desktop and mobile.

## Chapter 95 — Static and SEO pages

Port every static route and typed SEO landing definition. Preserve metadata, canonical, H1, content sections, FAQs, related links, and listing loader query. Implement sitemap and robots as server routes with correct MIME and caching. Query-filtered search pages remain noindex unless backed by a canonical landing page.

**Gate:** metadata/HTML snapshots and URL crawler match the baseline manifest.

## Chapter 96 — Auth and owner dashboard

Port registration, login, password reset, session persistence, role-aware redirects, navbar state, protected layouts, summary, listings, editor, uploads, inquiries, profile, settings, and logout. Prefer secure server-managed session cookies if adopted; if compatibility requires bearer storage during parity, document hardening and prevent token exposure in SSR/logs.

**Gate:** fresh client and migrated client complete the full owner lifecycle.

## Chapter 97 — Admin frontend

Port overview metrics/activity, listing filters/review, individual and bulk actions, inquiry management, users, email logs/content/composer/templates, and settings. Enforce route guards server-side and client-side, provide confirmation for sensitive actions, render partial bulk failures, and keep action feedback accessible.

**Gate:** admin acceptance matrix passes without FastAPI or Next.js runtime.

## Chapter 98 — SEO, accessibility, and visual parity

Validate titles, descriptions, canonicals, Open Graph/Twitter data, schema markup, H1/H2 order, sitemap, robots, noindex rules, keyboard navigation, focus, labels, contrast, reduced motion, image alt text, 320–1440px overflow, console errors, broken links, and performance budgets.

**Gate:** no critical accessibility/SEO/visual regression and production build/typecheck/tests pass.

---

## Part VIII — Final import, cutover, and operations

## Chapter 99 — Rehearsal and production cutover

Perform at least one complete rehearsal using the repository snapshot and one using a recent production-like export. For final cutover, announce maintenance, disable registration/listing/inquiry/admin writes on the VPS, allow safe reads, take fresh SQLite and media backups, verify checksums/integrity, convert/import D1, reconcile/upload R2, run counts/checksums/relationship tests, deploy the approved Worker release, configure production secrets, and run pre-DNS tests through the Worker hostname.

Switch `propertybikri.com`, `www`, and `api` only after auth, public search/detail, images, owner lifecycle, admin lifecycle, inquiries, Resend, static/SEO pages, sitemap, robots, and mobile smoke pass. Run the same tests after DNS. Record DNS values, Worker version, D1/R2 manifests, and cutover times. End maintenance only after write tests succeed against D1/R2.

**Stop conditions:** count mismatch, missing referenced image, privacy leak, inability for admin to authenticate/reset, broken listing create/approve/public flow, critical SEO route loss, failed rollback target, or unexplained 5xx.

## Chapter 100 — Rollback, monitoring, handoff, and retirement

Keep the VPS services, database, images, nginx configuration, and previous DNS values intact for at least 72 hours. Roll back DNS for sustained critical-route failure, data-write corruption, privacy exposure, auth outage, moderation outage, or unrecoverable D1/R2 inconsistency. After rollback, verify VPS health, public routes, admin login, and writes; preserve failed Worker/D1/R2 evidence for repair.

Monitor Worker errors/latency, D1 failures and query performance, R2 errors/missing objects, Resend delivery/bounce/complaint rates, authentication failures, rate limits, inquiry creation, listing creation/submission, moderation actions, sitemap availability, and synthetic critical journeys. Define alert thresholds and accountable responders.

Create final operations documentation containing Worker/resource names and IDs, domain routes, nonsecret environment inventory, deployment commands, migration history, D1 export/restore, R2 backup/restore, Resend setup, secret rotation, DNS rollback, incident response, and routine smoke tests. Remove or archive VPS runtime only after the stability window, backup verification, stakeholder approval, and confirmation that no traffic or writes depend on it.

**Final acceptance:** Cloudflare is authoritative; all production data and images are verified; every critical journey works; monitoring and backups are active; rollback evidence is retained; documentation is current; legacy retirement is separately approved.

---

## Required end-to-end acceptance matrix

### Data

- Source and D1 canonical table counts match, with every exception documented.
- Counts grouped by listing status, purpose, type, owner, inquiry status, and user role match.
- All IDs, listing slugs, normalized emails, and foreign-key relationships are preserved.
- All database-referenced images exist in R2 and match checksums.
- Reconciled extra images are attached deterministically; true orphans are quarantined and recoverable.
- Static and SEO content manifests contain every baseline route exactly once.

### Authentication and privacy

- Compatible existing accounts log in without reset.
- The incompatible account cannot authenticate insecurely and can complete reset.
- New registration, login, logout, profile update, reset, deactivation, and token invalidation work.
- Public JSON and rendered HTML contain no owner-private or admin-private data.
- Owners cannot access another owner’s listing, image, or inquiry.
- Clients cannot use any admin endpoint; inactive users are blocked immediately.

### Listings and media

- Public search filters, aliases, sorting, pagination, cover images, and totals work.
- Non-approved listings never appear publicly and public detail returns 404.
- Owner can create, edit, upload, delete image, submit, view feedback, resubmit, and archive under policy.
- Admin can review, approve, reject with note, unpublish, archive, and run bulk actions.
- Every lifecycle action produces correct timestamps, audit rows, and notifications.
- `/images/*` returns correct media, headers, cache behavior, and 404 responses.

### Inquiries and email

- Inquiry submission is limited to approved listings and is rate-limited.
- Admin and owner inquiry views respect their different privacy contracts.
- Inquiry status actions work and persist.
- All ten templates render and remain editable by admin.
- Resend sends are idempotent; logs, webhooks, delivery states, retries, bounces, and failures are visible.

### Frontend and SEO

- Every public, static, SEO, auth, dashboard, and admin route has an accounted-for TanStack equivalent.
- Homepage, search, detail, owner, and admin screens match current responsive behavior.
- Metadata, canonical URLs, schema data, sitemap, robots, noindex rules, and internal links are correct.
- Browser checks find no critical console error, hydration issue, broken link, horizontal overflow, or inaccessible primary control.
- Production build, typecheck, unit/integration tests, API contract tests, and browser acceptance tests pass.

### Operations

- Preview and final-production manifests, checksums, release IDs, and evidence are stored safely.
- Production secrets are outside git and unavailable to client bundles.
- D1 and R2 backup/restore procedures are rehearsed.
- DNS rollback target is verified before cutover.
- Synthetic monitoring covers homepage, health, search, detail image, login, listing submission, and admin review.
- The VPS remains recoverable through the stability window and is retired only by separate approval.

## Final execution rule

Implementation must follow chapter order unless the migration log records why a non-mutating preparation activity is safely parallel. Database and Worker backend parity through Chapter 90 are mandatory before frontend porting begins. Passing a local build never substitutes for preview D1/R2 tests, and passing preview never substitutes for final live verification. No operator may describe the migration as complete until Chapter 100 and the full acceptance matrix are closed with evidence.
