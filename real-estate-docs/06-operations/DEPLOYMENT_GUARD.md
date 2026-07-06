# DEPLOYMENT_GUARD

## Pre-Deploy Gates
- Backend health passes.
- Frontend build passes.
- DB path safe.
- Secrets configured outside git.
- Public phone configured.
- SMTP verified or `console` retained for staging.
- Admin user exists.
- Approved listing public smoke passes.
- Pending listing public leak test passes.
- Owner phone leak test passes.

## Production Env
- `ENVIRONMENT=production`
- strong `SECRET_KEY`
- production `DATABASE_URL`
- production `FRONTEND_URL`
- production `ALLOWED_ORIGINS`
- verified SMTP config
- final public phone/email

## Stop Deployment If
- old DB path appears.
- old brand appears publicly.
- public listing exposes owner private data.
- admin routes are accessible to client role.
- email sender domain is unverified.

