# REPO_MAP

## Purpose
Define the intended repository layout for the real estate MVP after cloning/adapting the ClearlyHired codebase.

## Target Root
`C:\realestatesite`

## Planned Runtime Folders
- `backend`: FastAPI backend source and scripts.
- `nextjs-frontend`: Next.js frontend source.
- `docs`: project documentation copied from this docs pack after implementation begins.
- `userdata`: runtime-only local uploads, logs, and generated files.

## Backend Source Zones
- `backend/app/main.py`: FastAPI app entrypoint.
- `backend/app/core/**`: settings, security, runtime guards.
- `backend/app/db/**`: async SQLAlchemy base/session.
- `backend/app/models/**`: SQLAlchemy models.
- `backend/app/routes/**`: API routers.
- `backend/app/schemas/**`: Pydantic contracts.
- `backend/app/services/**`: email, image storage, notification, security-limit services.
- `backend/scripts/**`: DB initialization, seeding, and safety checks.

## Frontend Source Zones
- `nextjs-frontend/src/app/**`: App Router pages/layouts.
- `nextjs-frontend/src/components/**`: UI components.
- `nextjs-frontend/src/lib/**`: API clients, auth helpers, utilities.
- `nextjs-frontend/public/**`: public static assets; edit with caution.

## Real Estate Domain Additions
- `property_listings`: listing lifecycle and public search truth.
- `property_images`: listing image metadata.
- `property_inquiries`: buyer/visitor lead capture.
- `property_audit_logs`: admin/owner listing timeline.

## Removed Or Deferred Surfaces
- Resume parser and optimizer.
- Job application tracking.
- Team job-search operations.
- Stripe billing pages and routes.
- Extension/archive material.

## Interpretation Rule
If cloned source still contains old job/resume code, treat it as legacy until explicitly converted, hidden, or removed.

