# BACKEND_ARCHITECTURE

## Purpose
Define backend architecture for the real estate MVP.

## Framework
- FastAPI.
- Async SQLAlchemy.
- SQLite for MVP.
- JWT auth.
- Provider-based email service.

## Router Groups
- `/health`: health checks.
- `/auth`: register, login, current user, password reset.
- `/settings`: basic user settings.
- `/properties`: public search/detail plus authenticated owner listing operations.
- `/admin/properties`: admin listing review and lifecycle operations.
- `/admin/inquiries`: admin inquiry management.
- `/admin/email/*`: email logs, templates, composer.
- `/admin/users`: admin user management.

## Required Services
- `PropertyImageService`: validates and stores listing images.
- `PropertyNotificationService`: sends/logs listing and inquiry emails.
- `EmailService`: provider-backed email dispatch and logs.
- `SecurityLimitService`: rate-limit sensitive writes.

## Runtime Guards
Backend startup must fail if:

- database URL points to a ClearlyHired DB.
- production secret is missing or placeholder.
- production email mode lacks SMTP configuration.
- public phone is missing while trying to approve listings.

## Implementation Rule
Do not expose raw ORM entities from public routes. Public routes must map to public response schemas.
