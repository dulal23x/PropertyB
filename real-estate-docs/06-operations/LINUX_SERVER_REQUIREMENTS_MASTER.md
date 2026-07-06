# LINUX_SERVER_REQUIREMENTS_MASTER

## Purpose
This is the canonical Linux deployment requirements runbook for PropertyBikri production hosting.

Primary topology:
- Frontend: `https://propertybikri.com`
- Redirect: `https://www.propertybikri.com` -> `https://propertybikri.com`
- Backend API: `https://api.propertybikri.com`

Primary process stack:
- Reverse proxy and TLS: `nginx` + `certbot`
- Process manager: `systemd`
- Backend app server: `uvicorn`
- Frontend app server: `next start`
- Database: SQLite `realestate_mvp_v1.db`

This runbook is intentionally strict and copy-safe so server install is repeatable and dependency-complete.

---

## Page 1 - Production Baseline Requirements

### Supported Linux Target
- Ubuntu 22.04 LTS x64 (recommended baseline)
- Ubuntu 24.04 LTS x64 (supported if Node and Python versions are pinned)

### Required Access and Roles
- A Linux user with `sudo` privileges
- DNS control for:
  - `propertybikri.com`
  - `www.propertybikri.com`
  - `api.propertybikri.com`
- Firewall access control (cloud panel and host firewall)

### Minimum Server Sizing (single-node MVP)
- CPU: 2 vCPU minimum, 4 vCPU recommended
- RAM: 4 GB minimum, 8 GB recommended
- Disk: 50 GB SSD minimum, 100 GB recommended
- Filesystem: ext4 or xfs

### Network and Security Requirements
- Open inbound ports: `80/tcp`, `443/tcp`
- Deny public inbound access to app internal ports (`3010`, `8090`)
- Outbound internet required for:
  - apt package mirrors
  - npm registry
  - PyPI
  - Let's Encrypt ACME

### Product Runtime Constraints
- Canonical runtime DB must remain `realestate_mvp_v1.db`
- Public property APIs must expose business contact only
- Admin/private owner data must never appear in public routes

---

## Page 2 - OS Package Dependencies (No-Miss Install List)

Install all required packages before app deploy:

```bash
sudo apt update
sudo apt install -y \
  git curl wget unzip ca-certificates software-properties-common \
  build-essential pkg-config \
  python3 python3-venv python3-pip python3-dev \
  libffi-dev libssl-dev \
  sqlite3 libsqlite3-dev \
  nginx \
  certbot python3-certbot-nginx \
  logrotate
```

### Validate installed tools
```bash
python3 --version
pip3 --version
node --version
npm --version
sqlite3 --version
nginx -v
certbot --version
```

### Node.js requirement
Project uses Next.js 14 and lockfile-based npm install. Use Node 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

Hard minimum target:
- Node >= 20.11
- npm >= 10

---

## Page 3 - Directory Layout, User Model, and Permissions

### Service user
```bash
sudo useradd -r -m -d /srv/propertybikri -s /bin/bash propertybikri || true
```

### Required filesystem layout
```bash
sudo mkdir -p /srv/propertybikri/releases
sudo mkdir -p /srv/propertybikri/shared/backend-venv
sudo mkdir -p /srv/propertybikri/shared/data/db
sudo mkdir -p /srv/propertybikri/shared/data/property-images
sudo mkdir -p /srv/propertybikri/shared/data/email-logs
sudo mkdir -p /etc/propertybikri
sudo chown -R propertybikri:propertybikri /srv/propertybikri
sudo chown -R propertybikri:propertybikri /etc/propertybikri
```

### Symlink conventions for active release
- Active app symlink: `/srv/propertybikri/current` -> `/srv/propertybikri/releases/<release-id>`
- Backend working dir: `/srv/propertybikri/current/app/backend`
- Frontend working dir: `/srv/propertybikri/current/nextjs-frontend`

### Runtime write-path requirements
Backend must have write permission to:
- `/srv/propertybikri/shared/data/db`
- `/srv/propertybikri/shared/data/property-images`
- `/srv/propertybikri/shared/data/email-logs`

Backend must not require write permission to code directories.

---

## Page 4 - Python Dependencies and Lock Strategy

### Required Python files in repo
- `app/backend/requirements.txt`
- `app/backend/requirements-prod.lock.txt`
- `app/backend/requirements-dev.txt`

### Production install rule
Always install from lock file in production:

```bash
cd /srv/propertybikri/current/app/backend
python3 -m venv /srv/propertybikri/shared/backend-venv
source /srv/propertybikri/shared/backend-venv/bin/activate
python -m pip install --upgrade pip wheel setuptools
pip install -r requirements-prod.lock.txt
pip check
```

### Lock maintenance rule
When dependencies change:
1. Update `requirements.txt`
2. Rebuild clean venv locally
3. Install from `requirements.txt`
4. Run smoke tests
5. Refresh `requirements-prod.lock.txt` with exact versions
6. Commit both files together

### Why this is required
- Prevents resolver drift between environments
- Makes remote deploy deterministic
- Avoids "works locally but fails on server" dependency mismatches

---

## Page 5 - Node/Next.js Dependencies and Build Requirements

### Required frontend package files
- `nextjs-frontend/package.json`
- `nextjs-frontend/package-lock.json`

### Production install rule
Use `npm ci` in production, never `npm install`:

```bash
cd /srv/propertybikri/current/nextjs-frontend
npm ci
npm run build
```

### Build prerequisites
- Node 20 LTS present
- Sufficient memory for Next.js build (`4GB+` recommended system memory)
- Frontend env file loaded before build (see env matrix page)

### Runtime start command
```bash
npm run start -- --hostname 127.0.0.1 --port 3010
```

### Frontend dependency validation
```bash
npm ls --depth=0
npm run lint
```

---

## Page 6 - Environment Variable Matrix (Production)

Create env files:
- Backend: `/etc/propertybikri/backend.env`
- Frontend: `/etc/propertybikri/frontend.env`

### Backend required variables
```env
APP_NAME=RealEstateSite Backend
PORT=8090
FRONTEND_URL=https://propertybikri.com
ALLOWED_ORIGINS=https://propertybikri.com,https://www.propertybikri.com
PUBLIC_SITE_URL=https://propertybikri.com
PUBLIC_API_URL=https://api.propertybikri.com
DATABASE_URL=sqlite+aiosqlite:////srv/propertybikri/shared/data/db/realestate_mvp_v1.db
SECRET_KEY=CHANGE_TO_LONG_RANDOM_SECRET
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

EMAIL_PROVIDER=console
EMAIL_LOG_DIR=/srv/propertybikri/shared/data/email-logs
REAL_ESTATE_PUBLIC_PHONE=+8801712345678
REAL_ESTATE_PUBLIC_EMAIL=info@propertybikri.com
REAL_ESTATE_SUPPORT_EMAIL=support@propertybikri.com
REAL_ESTATE_ADMIN_ALERT_EMAIL=admin@propertybikri.com

PROPERTY_IMAGE_MAX_COUNT=10
PROPERTY_IMAGE_MAX_BYTES=5242880
PROPERTY_IMAGE_ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
REQUIRE_IMAGE_FOR_APPROVAL=true
```

### Frontend required variables
```env
NEXT_PUBLIC_API_URL=https://api.propertybikri.com
NEXT_PUBLIC_SITE_URL=https://propertybikri.com
NEXT_PUBLIC_PUBLIC_PHONE=+8801712345678
NEXT_PUBLIC_PUBLIC_EMAIL=info@propertybikri.com
```

### SMTP switch requirements
When enabling SMTP in production:
- Set `EMAIL_PROVIDER=smtp`
- Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_USE_TLS`
- Verify SPF/DKIM/DMARC first

---

## Page 7 - systemd Service Definitions

### Backend systemd unit
File: `/etc/systemd/system/propertybikri-backend.service`

```ini
[Unit]
Description=PropertyBikri Backend (FastAPI/Uvicorn)
After=network.target

[Service]
User=propertybikri
Group=propertybikri
WorkingDirectory=/srv/propertybikri/current/app/backend
EnvironmentFile=/etc/propertybikri/backend.env
ExecStart=/srv/propertybikri/shared/backend-venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8090
Restart=always
RestartSec=3
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

### Frontend systemd unit
File: `/etc/systemd/system/propertybikri-frontend.service`

```ini
[Unit]
Description=PropertyBikri Frontend (Next.js)
After=network.target

[Service]
User=propertybikri
Group=propertybikri
WorkingDirectory=/srv/propertybikri/current/nextjs-frontend
EnvironmentFile=/etc/propertybikri/frontend.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3010
Restart=always
RestartSec=3
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

### Service activation
```bash
sudo systemctl daemon-reload
sudo systemctl enable propertybikri-backend propertybikri-frontend
sudo systemctl restart propertybikri-backend propertybikri-frontend
sudo systemctl status propertybikri-backend propertybikri-frontend --no-pager
```

---

## Page 8 - Nginx + Domain + TLS Requirements

### DNS records required
- `A/AAAA propertybikri.com` -> server IP
- `A/AAAA www.propertybikri.com` -> server IP
- `A/AAAA api.propertybikri.com` -> server IP

### Nginx site config
File: `/etc/nginx/sites-available/propertybikri.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name propertybikri.com www.propertybikri.com api.propertybikri.com;
    client_max_body_size 10m;

    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.propertybikri.com;
    return 301 https://propertybikri.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name propertybikri.com;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.propertybikri.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable and verify nginx
```bash
sudo ln -sf /etc/nginx/sites-available/propertybikri.conf /etc/nginx/sites-enabled/propertybikri.conf
sudo nginx -t
sudo systemctl reload nginx
```

### TLS issuance
```bash
sudo certbot --nginx -d propertybikri.com -d www.propertybikri.com -d api.propertybikri.com
sudo systemctl status certbot.timer --no-pager
```

---

## Page 9 - Deployment Procedure (Push to Live Safely)

### Release flow
1. Push code from CI/local to remote branch
2. Pull into new release directory
3. Link current release symlink
4. Install backend deps from lock file
5. Install frontend deps via `npm ci`
6. Build frontend
7. Restart services
8. Run smoke checks

### Example release commands
```bash
export RELEASE_ID=$(date +%Y%m%d-%H%M%S)
sudo -u propertybikri mkdir -p /srv/propertybikri/releases/$RELEASE_ID
sudo -u propertybikri git clone --depth 1 <YOUR_REPO_URL> /srv/propertybikri/releases/$RELEASE_ID
sudo ln -sfn /srv/propertybikri/releases/$RELEASE_ID /srv/propertybikri/current

cd /srv/propertybikri/current/app/backend
source /srv/propertybikri/shared/backend-venv/bin/activate
pip install -r requirements-prod.lock.txt

cd /srv/propertybikri/current/nextjs-frontend
npm ci
npm run build

sudo systemctl restart propertybikri-backend propertybikri-frontend
```

### Hard stop conditions
Do not proceed if any of the following occurs:
- `DATABASE_URL` does not point to `realestate_mvp_v1.db`
- Backend health endpoint fails
- Frontend build fails
- Public API leaks owner private fields
- Domain points to old brand or wrong host

---

## Page 10 - Verification, Monitoring, Backup, and Rollback

### Post-deploy verification commands
```bash
curl -I https://propertybikri.com
curl -I https://www.propertybikri.com
curl -sS https://api.propertybikri.com/health
curl -sS https://api.propertybikri.com/health/email
```

### Functional smoke checklist
- Homepage loads from `propertybikri.com`
- Search returns approved listings
- Listing detail loads image and business phone
- Register/login works
- Owner can create and submit listing
- Admin can approve listing
- Inquiry create works and email log is recorded

### Log monitoring commands
```bash
sudo journalctl -u propertybikri-backend -f
sudo journalctl -u propertybikri-frontend -f
sudo tail -f /var/log/nginx/error.log
```

### Backup requirements
Daily backup:
- `/srv/propertybikri/shared/data/db/realestate_mvp_v1.db`
- `/srv/propertybikri/shared/data/property-images/`
- `/srv/propertybikri/shared/data/email-logs/`

### Rollback sequence
1. Point `/srv/propertybikri/current` to previous release
2. Restore previous DB snapshot if needed
3. Restart both services
4. Verify health and functional smoke

### Final acceptance criteria
- Domain and API both reachable via HTTPS
- `www` redirects to apex
- Backend and frontend services healthy after reboot
- No missing dependency during clean reinstall
- No public data leak across contracts

---

## Mandatory Audit Log for Every Production Deploy
For each release record:
- Release ID
- Git commit SHA
- Backend lock file hash
- Frontend lock file hash
- Smoke test results
- Rollback readiness confirmation

If this audit record is missing, deployment is considered incomplete.
