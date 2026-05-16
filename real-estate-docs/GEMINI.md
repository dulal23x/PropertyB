# GEMINI.md - RealEstateSite Gemini Entrypoint

Read this file first only as a tool-specific entrypoint. Canonical rules live in `PROJECT_MASTER_RULES.md`.

## Required Context
- `PROJECT_MASTER_RULES.md`
- `MASTER_INDEX.md`
- `02-context/ACTIVE_DIRECTION.md`
- `02-context/CURRENT_STATE.md`
- `05-contracts/API_CONTRACTS.md`
- `05-contracts/SCHEMA_CONTRACTS.md`
- `05-contracts/STORAGE_CONTRACTS.md`
- `05-contracts/UI_ROUTE_MAP.md`

## Gemini-Specific Workflow
- Use high reasoning for planning and architecture review.
- Use fast execution mode for implementation after docs/contracts are read.
- Use lightweight verification mode for final tests and browser checks.
- Never implement from memory when live code or contracts can be checked.

## Critical Real Estate Rules
- Public listing responses expose only approved listing data and business contact info.
- Owner phone/email remain private.
- Admin approval is required before publication.
- The project DB is `realestate_mvp_v1.db`.
- `C:\ClearlyHired` is source/reference only; do not mutate it.
