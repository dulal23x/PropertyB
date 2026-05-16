# DECISIONS_LOG

## 2026-05-15
- Decision: Use `RealEstateSite` as placeholder name until final project/domain are chosen.
- Decision: Use `C:\realestatesite` as target workspace.
- Decision: Use `realestate_mvp_v1.db` as MVP SQLite database.
- Decision: Public contact number is the business phone, never owner phone.
- Decision: Hide/defer billing, resume parser, job applications, and team job-search workflows.
- Decision: Keep email provider/log/template/composer pattern and rebrand it for listing/inquiry notifications.
- Decision: Seed one default admin at backend startup for first local boot (`admin@realestate.com`), intended for local initialization and to be replaced in real deployment.
- Decision: Use `pbkdf2_sha256` password hashing due Python 3.14 `bcrypt` compatibility issues in this environment.
- Decision: Keep `C:\realestatesite\app\backend` as implementation target for this phase because `PROJECT_MASTER_RULES.md` is canonical for this workspace.
- Decision: Keep integer IDs in current backend phase and defer UUID migration to a dedicated migration phase to avoid breaking the already-running MVP baseline.
- Decision: Add runtime SQLite schema-backfill for newly added listing columns to preserve compatibility with previously created local DB files.
- Decision: Implement additive `*_v2` schema with trigger-based dual-write and backfill-first sync, while keeping current read paths unchanged for non-breaking rollout.
- Decision: Keep integer PK compatibility and add `public_id` UUID-like keys in `*_v2` tables as external-stable identifiers for future PostgreSQL migration.
- Decision: Do not drop any table automatically during startup; expose legacy candidate detection and keep drop operations manual/approved.
- Decision: Add admin user-management endpoints to align runtime backend with architecture docs without changing existing public API paths.
- Decision: Make `migration_state` a single durable boot record instead of an append-only log row to avoid unbounded startup churn.

## 2026-05-16
- Decision: Keep `realestate_mvp_v1.db` as the backend default runtime database and treat `bproperty_clone.db` as seed/demo input only.
- Decision: Normalize frontend API usage around canonical backend query names while keeping compatibility aliases for `purpose` and `type`.
- Decision: Keep frontend auth as JWT plus lightweight presence cookie in local storage/cookie storage for route guards during MVP.
- Decision: Use a dedicated `useAuthSession` hook as the source of truth for client-side authentication to avoid stale localStorage reads.
- Decision: Redirect admins attempting to access `/dashboard` routes to `/admin` to prevent accidental listing creation by administrative accounts.
- Decision: Implement a "Get a Callback" reveal button to protect the global contact number from low-level scrapers while providing clear CTA.
- Decision: Use `/me-summary` instead of `/me/summary` to avoid routing collision with `/me/{listing_id}` in FastAPI due to variable path precedence.
- Decision: Harden `get_current_user` to strictly reject users where `is_active=false`, ensuring admin account-deactivation is enforced immediately at the API layer.
- Decision: Extract listing form logic into `ListingEditorForm` to ensure create and edit flows stay in sync as new fields are added.
- Decision: Limit owner-side inquiry visibility to listings they own, excluding sensitive buyer-internal data.
