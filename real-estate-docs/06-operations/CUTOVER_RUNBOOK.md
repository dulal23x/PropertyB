# PropertyBikri Cloudflare Production Cutover Runbook

- **Target Architecture**: Cloudflare Workers + D1 + R2 + Resend
- **App Root**: `tanstack-app/`
- **Reference Plan**: `real-estate-docs/06-operations/PROPERTYBIKRI_100_CHAPTER_TANSTACK_CLOUDFLARE_MIGRATION_MASTER_PLAN.md` (Chapters 99–100)

---

## 1. Pre-Deployment Verification Summary

All local integration, parity, and SSR rendering gates have been executed and verified:
1. **D1 Migrations Verification**: 11 canonical tables, 18 covering indexes, 0 foreign key errors (`verify_migrations.py`).
2. **Web Crypto Parity**: PBKDF2-SHA256 Passlib compatibility, HS256 JWT, R2 key sanitization (10/10 PASS).
3. **Backend API Parity**: Health, Auth, Public Properties, Owner Dashboard, Admin Moderation, R2 Media streaming (27/27 PASS).
4. **Full-Stack SSR Site**: Homepage, Discovery/Filter Search, Property Details, 90 Programmatic SEO Landing Pages, Static Corporate Pages, XML Sitemap, Robots.txt, and 404 Fallback (42/42 PASS).

---

## 2. Production Provisioning & Remote Deployment

### Step 1: Cloudflare D1 Remote Database Setup
Execute the canonical migrations and rehearsal seed data against your remote Cloudflare D1 database:

```bash
cd tanstack-app

# 1. Apply schema DDL
npx wrangler d1 migrations apply propertybikri-db --remote
```

### Step 2: Cloudflare R2 Media Bucket Sync
Upload media assets to your Cloudflare R2 bucket (`propertybikri-images`):

```bash
# Verify R2 bucket access
npx wrangler r2 bucket list

# Optional bulk sync from reconciled manifest
python ../scripts/reconcile_images_r2.py
```

### Step 3: Production Secrets Configuration
Set your production environment secrets in Cloudflare Workers:

```bash
cd tanstack-app

# Production JWT Secret Key (min 32 characters)
npx wrangler secret put JWT_SECRET

# Production Resend API Key for automated transactional emails
npx wrangler secret put RESEND_API_KEY
```

### Step 4: Deploy Worker Application
Deploy the unified full-stack application to Cloudflare Edge:

```bash
cd tanstack-app

npx wrangler deploy --env production
```

---

## 3. Post-Deployment Smoke Test Checklist

After deployment, verify the production domain (`https://propertybikri.com`):

- [ ] **Health Endpoint**: `curl https://propertybikri.com/health` $\rightarrow$ `{"status": "healthy"}`
- [ ] **Homepage**: Verify `GET https://propertybikri.com/` returns 200 with verified listings.
- [ ] **Search & Filters**: `https://propertybikri.com/properties?purpose=sale&area_name=Gulshan`
- [ ] **SEO Landing Pages**: `https://propertybikri.com/flat-for-sale-in-gulshan`
- [ ] **XML Sitemap**: `curl https://propertybikri.com/sitemap.xml` $\rightarrow$ Valid XML with 100+ URLs.
- [ ] **Robots.txt**: `curl https://propertybikri.com/robots.txt` $\rightarrow$ Disallows `/admin` and links sitemap.
- [ ] **R2 Media**: Verify property image assets load cleanly under `/images/:listingId/:filename`.
- [ ] **Admin Login & Moderation**: Log in at `https://propertybikri.com/auth/login` and verify moderation actions.
