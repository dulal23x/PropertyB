# ENVIRONMENT_VARIABLES

## Backend
- `DATABASE_URL`: must point to `realestate_mvp_v1.db`.
- `SECRET_KEY`: JWT signing key; production must not use placeholder.
- `ALLOWED_ORIGINS`: include `http://localhost:3010`.
- `FRONTEND_URL`: default `http://localhost:3010`.
- Production `FRONTEND_URL`: `https://propertybikri.com`.
- Production `ALLOWED_ORIGINS`: include `https://propertybikri.com,https://www.propertybikri.com`.
- `PORT`: default `8090`.
- `PUBLIC_SITE_URL`: public website origin, default `https://propertybikri.com`.
- `PUBLIC_API_URL`: public API origin, default `https://api.propertybikri.com`.
- `EMAIL_PROVIDER`: `console` for dev, `smtp` for production.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_USE_TLS`: SMTP mode.
- `EMAIL_LOG_DIR`: email log storage path.
- `REAL_ESTATE_PUBLIC_PHONE`: business phone shown on public listings.
- `REAL_ESTATE_PUBLIC_EMAIL`: public business email.
- `REAL_ESTATE_ADMIN_ALERT_EMAIL`: internal recipient for listing/inquiry alerts.
- `ADMIN_WRITE_HOURLY_LIMIT`: admin write rate limit.
- `REGISTER_IP_LIMIT_PER_HOUR`: signup protection.
- `LOGIN_MAX_FAILED_ATTEMPTS`: login protection.

## Frontend
- `NEXT_PUBLIC_API_URL`: `http://127.0.0.1:8090`.
- Production `NEXT_PUBLIC_API_URL`: `https://api.propertybikri.com`.
- `NEXT_PUBLIC_SITE_URL`: `https://propertybikri.com` for canonical metadata/sitemap/robots.
- `NEXT_PUBLIC_PUBLIC_PHONE`: public business phone if frontend needs build-time fallback.
- `NEXT_PUBLIC_PUBLIC_EMAIL`: public business email if frontend needs build-time fallback.

## Forbidden In This Project
- `clearlyhired_v2.db` as active DB.
- old production SMTP secrets from the reference project.
- old Stripe keys unless monetization is explicitly planned.
- real secrets in committed docs or frontend files.

