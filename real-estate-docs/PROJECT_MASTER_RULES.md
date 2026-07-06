# PROJECT_MASTER_RULES - RealEstateSite Canonical Source Of Truth

## Purpose
This file is the canonical policy for the real estate MVP project. `AGENTS.md` and `GEMINI.md` must stay aligned with this file and must not introduce conflicting behavior.

## Product Mission
Build a Bangladesh-style real estate MVP similar in scope to the essential listing/search flows of Bproperty and bdHousing: users create property or land listings, admins review them, approved listings become publicly searchable, and inquiries route to the business.

## Absolute Safety Rules
1. Do not edit `C:\ClearlyHired`; it is reference-only after clone.
2. The target workspace is `C:\realestatesite`.
3. The project database is `realestate_mvp_v1.db`.
4. Backend port default is `8090`; frontend port default is `3010`.
5. Public contact number is the business phone from environment/config, never a listing owner's phone.
6. Public APIs return approved listings only.
7. Admin approval is required before publication.
8. Secrets stay in backend runtime env and are never committed.
9. Contract docs must be updated with any API/schema/storage/route change.
10. Do not restore resume/job/parser/team job-search logic as product surface.
11. Do not commit or push anything without the user's explicit permission.

## Tiered Discovery
### Tier 1 - Every Session
1. `PROJECT_MASTER_RULES.md`
2. `MASTER_INDEX.md`
3. `02-context/ACTIVE_DIRECTION.md`
4. `02-context/CURRENT_STATE.md`
5. `AGENTS.md` and `GEMINI.md` for entrypoint alignment

### Tier 2 - Feature Work
- Architecture: `01-architecture/*`
- Development guardrails: `03-development/*`
- Feature truth: `04-features/*`
- Contracts: `05-contracts/*`
- Operations: `06-operations/*`

## Engineering Workflow
1. Identify the exact feature and source-of-truth docs.
2. Inspect live code before changing behavior.
3. Classify touched files as source, generated, archive, or config.
4. Trace inbound and outbound dependencies.
5. Make the smallest safe change.
6. Verify with tests, browser smoke, logs, or curl.
7. Update contracts, changelog, and decisions.

## Product Workflow Truth
- Visitor: search and view approved listings, submit inquiries.
- Client/listing owner: signup/login, create drafts, submit listings, see status and admin feedback.
- Admin: approve/reject/unpublish listings, manage inquiries, users, email logs/templates.

## Fail-Closed Gates
Stop implementation if any of these are true:
- DB points to an old/reference database.
- Frontend calls the old backend port.
- Public API includes owner private data.
- Email sends from an old or unverified domain in production mode.
- Approval action is accessible to non-admin users.
- Pending/rejected listings appear in public search.

Last updated: 2026-05-15.
