# CHANGELOG

## 2026-05-15
- Created real estate MVP documentation pack plan.
- Defined project rules, architecture, contracts, features, development, and operations docs for future implementation.
- Implemented initial backend in `C:\realestatesite\app\backend` using FastAPI + SQLAlchemy async SQLite (`realestate_mvp_v1.db`).
- Added auth, owner listing lifecycle, public approved-only search/detail, inquiry capture, admin listing actions, and admin email hub APIs following `05-contracts/API_CONTRACTS.md`.
- Added startup DB initialization with default email templates and seed admin user.
- Added end-to-end backend test covering register/login, listing submit/approve/reject, public privacy checks, inquiry flow, and admin access control.
- Added fail-closed database guard for `DATABASE_URL` to prevent ClearlyHired DB/path reuse.
- Expanded property schema support and runtime SQLite column backfill for remaining MVP listing fields.
- Completed public/admin API filters, pagination, sorting, and strict approved-only/public-privacy gating.
- Enforced submission/approval rules including image readiness and business-phone check.
- Upgraded email notifications to explicit real-estate event senders while keeping admin email hub behavior.
- Replaced single flow test with broader contract tests including DB guard, owner isolation, image validation, state transitions, inquiry flow, and email logs.
- Ran backend manual smoke flow and recorded results in `02-context/REAL_ESTATE_BACKEND_SMOKE_REPORT.md`.
- Backend deepening hardening pass completed without API path changes: centralized property policy checks, admin inquiries query optimization (N+1 removed), and safer 500 error handling.
- Test suite refactored into focused modules with one retained integration flow test; full suite now passes (`6 passed`).
- Implemented additive database scalability layer with `*_v2` tables, indexes, dual-write triggers, and startup backfill while preserving current API behavior.
- Added admin migration visibility endpoints for v2 drift status and legacy-table candidate discovery.
- Extended test suite for v2 dual-write/drift checks and legacy-candidate verification; full backend suite now passes (`7 passed`).
- Added admin user-management endpoints to match backend architecture docs.
- Fixed startup migration-state churn so boot does not append duplicate `migration_state` rows.
- Full backend suite now passes (`8 passed`).

## 2026-05-16
- Added root `REAL_ESTATE_DATABASE_FLOW_AND_IMPLEMENTATION_PLAN.md` with SQLite MVP-first database and implementation sequencing.
- Switched the backend default database target to `realestate_mvp_v1.db` and expanded allowed frontend origins for local dev.
- Added shared frontend API/auth helpers and began replacing hardcoded backend calls with contract-driven calls.
- Normalized public search and detail pages to use canonical listing query names and backend-driven currency/contact fields.
- Replaced mock owner dashboard/listing creation entry points with backend-backed draft creation and listing reads.
