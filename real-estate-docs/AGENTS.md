# AGENTS.md - RealEstateSite Agent Guardrails

## Purpose
Root operating guide for agents working on the future real estate marketplace project under `C:\realestatesite`. This file is an entrypoint summary only. The canonical policy is `PROJECT_MASTER_RULES.md`.

## Mandatory Read Order
1. `PROJECT_MASTER_RULES.md`
2. `MASTER_INDEX.md`
3. `02-context/ACTIVE_DIRECTION.md`
4. `02-context/CURRENT_STATE.md`
5. Relevant contracts under `05-contracts/`
6. Relevant feature docs under `04-features/`

## Project Boundary
- `C:\realestatesite` is the target project workspace.
- `C:\ClearlyHired` is reference-only and must not be edited while building this project.
- If the implementation starts by cloning from ClearlyHired, the clone must be isolated before any feature work.
- New backend DB must be `realestate_mvp_v1.db`, not any legacy ClearlyHired database.

## Non-Negotiable Guardrails
- Never guess endpoints, schemas, response shapes, storage keys, route inventory, or email template variables.
- Public APIs must never expose listing owner phone, owner email, owner user id, admin notes, or private address fields.
- Public property search/detail must return `approved` listings only.
- Listing publication requires admin approval.
- Client dashboard can manage only the signed-in user's own listings.
- Admin dashboard owns approval, rejection, unpublish, inquiry review, user management, and email operations.
- Email secrets stay in backend runtime environment only. Never write them to docs, frontend files, logs, or commits.
- Update contracts whenever API/schema/storage/routes change.

## Editable Zones After Clone
- `backend/app/**`
- `backend/scripts/**`
- `nextjs-frontend/src/**`
- `nextjs-frontend/public/**` with caution
- `docs/**`
- root project rule/docs files

## Blocked Or High-Risk Zones
- Reference repo `C:\ClearlyHired/**`
- generated caches and build outputs
- database files unless explicitly created for the real estate app
- `.env` files containing real secrets

## Product-Specific Rules
- Contact number shown publicly is the business real estate phone, not the client/listing owner phone.
- Project name and domain are TBD; use `RealEstateSite` only as a placeholder until chosen.
- Billing is deferred; hide subscription/Stripe flows until monetization is explicitly planned.
- Resume, job application, parser, and team job-search flows are out of scope.

Last updated: 2026-05-15.
