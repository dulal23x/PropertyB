# PROPERTYBIKRI VPS MIGRATION

## Current Production Shape

- Public site: `https://propertybikri.com`
- Public API: `https://api.propertybikri.com`
- Source root on the current VPS: `/home/ubuntu/RealEstate`
- Live release root on the current VPS: `/srv/propertybikri/current`
- Backend app root inside the repo: `app/backend`
- Frontend app root inside the repo: `nextjs-frontend`
- SQLite DB path for repo/local installs: `app/backend/realestate_mvp_v1.db`
- Runtime upload path after restore: `app/backend/userdata/property-images`
- Backend port: `8090`
- Frontend port: `3000` for production, `3013` for local preview when needed

## Files Included For Migration

- `app/backend/realestate_mvp_v1.db`
  - Current live SQLite database copied from production.
- `migration/propertybikri-runtime-assets-20260810.tar.gz`
  - Current live `property-images` runtime upload folder.
- `migration/propertybikri-runtime-checksums-20260810.sha256`
  - SHA-256 checksums for the DB and asset archive.
- `app/backend/requirements.txt`
  - Backend Python dependency list.
- `app/backend/requirements-prod.lock.txt`
  - Pinned backend production dependency list.
- `nextjs-frontend/package.json` and `nextjs-frontend/package-lock.json`
  - Frontend dependency and lock files.

## Server Requirements

- Ubuntu 22.04 or 24.04 LTS
- Python 3.12 preferred
- Node.js 20 LTS
- npm from the Node.js 20 install
- nginx or another reverse proxy
- systemd for process management
- A TLS provider such as Certbot

## First Install On A New VPS

```bash
set -euo pipefail
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  git curl ca-certificates python3 python3-venv python3-pip nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
```

Clone the repo:

```bash
set -euo pipefail
cd /opt
sudo git clone git@github.com:dulal23x/RealEstate.git propertybikri
sudo chown -R "$USER:$USER" /opt/propertybikri
cd /opt/propertybikri
```

## Restore DB And Runtime Assets

The DB is already committed at the backend path. Restore the runtime images beside it:

```bash
set -euo pipefail
cd /opt/propertybikri
sha256sum -c migration/propertybikri-runtime-checksums-20260810.sha256
mkdir -p app/backend/userdata
tar -C app/backend/userdata -xzf migration/propertybikri-runtime-assets-20260810.tar.gz
```

After extraction, this path must exist:

```bash
ls -lah app/backend/userdata/property-images
```

## Backend Setup

```bash
set -euo pipefail
cd /opt/propertybikri/app/backend
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-prod.lock.txt
```

Create `app/backend/.env`:

```env
APP_NAME=PropertyBikri Backend
PORT=8090
FRONTEND_URL=https://propertybikri.com
ALLOWED_ORIGINS=https://propertybikri.com,https://www.propertybikri.com
PUBLIC_SITE_URL=https://propertybikri.com
PUBLIC_API_URL=https://api.propertybikri.com
DATABASE_URL=sqlite+aiosqlite:///./realestate_mvp_v1.db
SECRET_KEY=replace-with-a-long-random-secret
EMAIL_PROVIDER=console
REAL_ESTATE_PUBLIC_PHONE=+8801717-849009
REAL_ESTATE_PUBLIC_EMAIL=info@propertybikri.com
REAL_ESTATE_SUPPORT_EMAIL=support@propertybikri.com
REAL_ESTATE_ADMIN_ALERT_EMAIL=admin@propertybikri.com
REQUIRE_IMAGE_FOR_APPROVAL=true
```

Smoke test the backend:

```bash
set -euo pipefail
cd /opt/propertybikri/app/backend
. .venv/bin/activate
python -m py_compile app/main.py
uvicorn app.main:app --host 127.0.0.1 --port 8090
```

In another shell:

```bash
curl -fsS http://127.0.0.1:8090/health
curl -fsS 'http://127.0.0.1:8090/properties?listing_purpose=sale&page=1&page_size=1'
```

## Frontend Setup

```bash
set -euo pipefail
cd /opt/propertybikri/nextjs-frontend
npm ci
```

Create `nextjs-frontend/.env.production`:

```env
NEXT_PUBLIC_SITE_URL=https://propertybikri.com
NEXT_PUBLIC_API_URL=https://api.propertybikri.com
NEXT_PUBLIC_PUBLIC_API_URL=https://api.propertybikri.com
NEXT_PUBLIC_DEPLOY_LASTMOD=2026-08-10T00:00:00.000Z
```

Build:

```bash
npm run build
```

## systemd Units

Backend example:

```ini
[Unit]
Description=PropertyBikri Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/propertybikri/app/backend
EnvironmentFile=/opt/propertybikri/app/backend/.env
ExecStart=/opt/propertybikri/app/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Frontend example:

```ini
[Unit]
Description=PropertyBikri Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/propertybikri/nextjs-frontend
Environment=NODE_ENV=production
EnvironmentFile=/opt/propertybikri/nextjs-frontend/.env.production
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Reverse Proxy Routes

- `propertybikri.com` and `www.propertybikri.com` proxy to `127.0.0.1:3000`
- `api.propertybikri.com` proxies to `127.0.0.1:8090`

The backend serves uploaded property images under:

```text
https://api.propertybikri.com/images/<listing-id>/<file>
```

## Post-Migration Checks

```bash
curl -fsS https://api.propertybikri.com/health
curl -fsS 'https://api.propertybikri.com/properties?listing_purpose=sale&page=1&page_size=1'
curl -fsS https://propertybikri.com/sitemap.xml | head
curl -fsS https://propertybikri.com/ | grep -i 'Houses, Lands'
```

Also verify in a browser:

- Homepage loads with the PropertyBikri header and footer logos.
- Buy, Rent, apartment, house, land, and commercial menu pages load.
- Listing detail pages load metadata and images.
- Fallback listing images use `default-site-banner.png` where there are no listing photos.
- WhatsApp, phone, address, and Facebook footer links are visible on mobile.

## Rules For Future Updates

- Keep production `.env` secrets outside git.
- Before replacing production, back up the DB and `userdata/property-images`.
- Do not use stale reference databases as fallback production data.
- Run `npm run build` before pushing deployable frontend changes.
- Run backend compile or tests before pushing backend changes.
