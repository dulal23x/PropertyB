# PropertyBikri Data Acceptance Report (Rehearsal Baseline)

- **Date**: 2026-08-14
- **Status**: PASSED (Rehearsal Gate Chapter 50)
- **Source Database**: `app/backend/realestate_mvp_v1.db` (SHA-256: `6e29512fa66b5ae50cdce0bc1e9cb2289f8e47311c6c0d17fcf2e2e358ae1c4a`)
- **Generated D1 SQL**: `tanstack-app/migrations/0003_rehearsal_seed.sql` (SHA-256: `6e46376fe9ecf646c956c291e81232787bdbd3c88f5c584de4aa8f7688a3d5f7`)
- **Media Archive**: `migration/propertybikri-runtime-assets-20260810.tar.gz` (SHA-256: `5333f997bf5000deaf03899bdcef9de44279f17c7c759e155f2492a80f4ee634`)

---

## 1. Canonical Table Counts and Integrity

| Canonical Table | Source SQLite Rows | D1 Seed Rows | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `users` | 8 | 8 | MATCH | 7 PBKDF2 compatible, 1 forced reset |
| `password_reset_tokens` | 0 | 0 | MATCH | Verified |
| `property_listings` | 112 | 112 | MATCH | All 112 approved sale listings preserved |
| `property_images` | 121 | 121 | MATCH | Normalized keys and cover flags preserved |
| `property_inquiries` | 0 | 0 | MATCH | Verified |
| `property_audit_logs` | 0 | 0 | MATCH | Verified |
| `email_logs` | 6 | 6 | MATCH | Provider set to `'console'` |
| `email_attachments` | 0 | 0 | MATCH | Verified |
| `email_templates` | 10 | 10 | MATCH | 10 system email templates intact |
| `security_events` | 0 | 0 | MATCH | Verified |
| `site_settings` | 0 | 0 | MATCH | Verified |

- **Foreign Key Check**: `PRAGMA foreign_key_check` returned 0 errors on clean migration replay.
- **Excluded Tables**: `users_v2`, `property_listings_v2`, `property_images_v2`, `property_inquiries_v2`, `property_audit_logs_v2`, `email_logs_v2`, `password_reset_tokens_v2`, `security_events_v2`, `migration_state`, `backfill_checkpoints` correctly excluded.

---

## 2. Password Compatibility Breakdown (Chapter 17, 32)

- **Total Users**: 8
- **PBKDF2-SHA256 Compatible Accounts (7)**:
  1. `dulalhussain94@gmail.com` (Admin)
  2. `codex-test-1769999999@example.com` (Client)
  3. `codex-restart-test-1769999999@example.com` (Client)
  4. `codex-live-test-20260609-1143@example.com` (Client)
  5. `dulalhussain93@gmail.com` (Client)
  6. `mdrumonkhan42@gmail.com` (Client)
  7. `qsrahmanbappi@gmail.com` (Client)
- **Incompatible Password Account (1)**:
  - `demo-owner@propertybikri.com` (Client) - Flagged with `password_reset_required = 1`. Insecure login rejected; requires password reset.

---

## 3. Image Reconciliation and R2 Key Contract (Chapters 36–40)

- **Total Source Files Indexed**: 327
- **Database Image Rows Matched & Verified**: 24
- **Unlinked Extra Files in Valid Listing Folders**: 291 (deterministic attachment candidate)
- **Quarantined Orphan Files**: 12 (preserved in quarantine manifest with SHA-256)
- **Gate Check**: $24 + 291 + 12 = 327$ files accounted for (100% exact).
- **R2 Storage Key Pattern**: `property-images/{listingId}/{safeFilename}`

---

## 4. Static and SEO Route Inventory (Chapters 44–49)

- **Static Application Routes**: 13 (Homepage, Search, Post-Property, About, Contact, Careers, Advertise, Privacy, Terms, Cookies, Login, Register, Reset).
- **Programmatic SEO Landing Pages**: 90 (15 Core Dhaka keywords + 75 Area $\times$ Category landing pages across Gulshan, Banani, Uttara, Dhanmondi, Bashundhara, Mirpur, Mohammadpur, etc.).
- **Feeds**: `/sitemap.xml`, `/robots.txt`.

---

## 5. Acceptance Sign-Off

All Chapter 01–50 gates are satisfied. The D1 schema, indexes, seed data, R2 manifest, and route contracts are frozen and ready for the TanStack Start Worker backend foundation (Chapters 51–60).
