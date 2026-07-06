# ENVIRONMENT_MATRIX_PROD_STAGING

## Rules
- Do not commit real secrets to git.
- Keep env files in `/etc/propertybikri/`.
- Keep backend and frontend env files separate.
- Production SMTP must be enabled only after sender-domain verification.

## Backend - Required Keys
| Key | Staging Example | Production Example | Required |
|---|---|---|---|
| `APP_NAME` | `RealEstateSite Backend` | `RealEstateSite Backend` | Yes |
| `PORT` | `8090` | `8090` | Yes |
| `FRONTEND_URL` | `https://staging.propertybikri.com` | `https://propertybikri.com` | Yes |
| `ALLOWED_ORIGINS` | `https://staging.propertybikri.com` | `https://propertybikri.com,https://www.propertybikri.com` | Yes |
| `PUBLIC_SITE_URL` | `https://staging.propertybikri.com` | `https://propertybikri.com` | Yes |
| `PUBLIC_API_URL` | `https://api-staging.propertybikri.com` | `https://api.propertybikri.com` | Yes |
| `DATABASE_URL` | `sqlite+aiosqlite:////srv/propertybikri/shared/data/db/realestate_mvp_v1.db` | Same | Yes |
| `SECRET_KEY` | Random 64+ chars | Random 64+ chars | Yes |
| `ALGORITHM` | `HS256` | `HS256` | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | `1440` | Yes |
| `EMAIL_PROVIDER` | `console` | `console` or `smtp` | Yes |
| `EMAIL_LOG_DIR` | `/srv/propertybikri/shared/data/email-logs` | Same | Yes |
| `REAL_ESTATE_PUBLIC_PHONE` | `+88017XXXXXXXX` | Final business phone | Yes |
| `REAL_ESTATE_PUBLIC_EMAIL` | `info@staging.propertybikri.com` | `info@propertybikri.com` | Yes |
| `REAL_ESTATE_SUPPORT_EMAIL` | `support@staging.propertybikri.com` | `support@propertybikri.com` | Yes |
| `REAL_ESTATE_ADMIN_ALERT_EMAIL` | `admin@staging.propertybikri.com` | `admin@propertybikri.com` | Yes |
| `PROPERTY_IMAGE_MAX_COUNT` | `10` | `10` | Yes |
| `PROPERTY_IMAGE_MAX_BYTES` | `5242880` | `5242880` | Yes |
| `PROPERTY_IMAGE_ALLOWED_EXTENSIONS` | `jpg,jpeg,png,webp` | `jpg,jpeg,png,webp` | Yes |
| `REQUIRE_IMAGE_FOR_APPROVAL` | `true` | `true` | Yes |

## Backend - SMTP Keys (only when `EMAIL_PROVIDER=smtp`)
| Key | Example | Required |
|---|---|---|
| `SMTP_HOST` | `smtp.zoho.com` | Yes |
| `SMTP_PORT` | `587` | Yes |
| `SMTP_USER` | `noreply@propertybikri.com` | Yes |
| `SMTP_PASS` | `<secret>` | Yes |
| `SMTP_USE_TLS` | `true` | Yes |

## Frontend - Required Keys
| Key | Staging Example | Production Example | Required |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.propertybikri.com` | `https://api.propertybikri.com` | Yes |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.propertybikri.com` | `https://propertybikri.com` | Yes |
| `NEXT_PUBLIC_PUBLIC_PHONE` | `+88017XXXXXXXX` | Final business phone | Yes |
| `NEXT_PUBLIC_PUBLIC_EMAIL` | `info@staging.propertybikri.com` | `info@propertybikri.com` | Yes |

## Backend env file template
```env
APP_NAME=RealEstateSite Backend
PORT=8090
FRONTEND_URL=https://propertybikri.com
ALLOWED_ORIGINS=https://propertybikri.com,https://www.propertybikri.com
PUBLIC_SITE_URL=https://propertybikri.com
PUBLIC_API_URL=https://api.propertybikri.com
DATABASE_URL=sqlite+aiosqlite:////srv/propertybikri/shared/data/db/realestate_mvp_v1.db
SECRET_KEY=CHANGE_ME
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

## Frontend env file template
```env
NEXT_PUBLIC_API_URL=https://api.propertybikri.com
NEXT_PUBLIC_SITE_URL=https://propertybikri.com
NEXT_PUBLIC_PUBLIC_PHONE=+8801712345678
NEXT_PUBLIC_PUBLIC_EMAIL=info@propertybikri.com
```
