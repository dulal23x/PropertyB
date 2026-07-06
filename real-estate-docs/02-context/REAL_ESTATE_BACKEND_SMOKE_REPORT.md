# REAL_ESTATE_BACKEND_SMOKE_REPORT

## Run Date
- 2026-05-15

## Environment
- Backend root: `C:\realestatesite\app\backend`
- Base URL: `http://127.0.0.1:8090`
- DB target: `realestate_mvp_v1.db`
- Email provider: `console`

## Commands And Checks
1. Start backend server on `8090`.
2. `GET /health` -> `status=ok`.
3. `GET /health/email` -> `provider=console`, `status=ok`.
4. Register owner: `smoke_owner@example.com`.
5. Create listing: `Smoke Listing`.
6. Upload listing image (`.jpg`, cover=true).
7. Submit listing for review.
8. Public search before approval (`keyword=Smoke`) returned `0` items.
9. Login admin (`admin@realestate.com`) and approve listing.
10. Public detail loaded for approved listing slug.
11. Verified public detail contains business phone and does not contain owner user id.
12. Submit inquiry on approved listing.
13. Admin inquiries endpoint shows inquiry.
14. Admin email logs endpoint shows related events.

## Snapshot Values
- listing_id: `1`
- listing_slug: `smoke-listing-1778837261`
- inquiry_id: `1`
- pending_visible_count: `0`
- approved_status: `approved`
- public_has_business_phone: `true`
- public_has_owner_user_id: `false`
- admin_inquiry_count: `1`
- email_log_count: `5`

## Outcome
- Smoke pass.
- No critical backend blocker found in this run.
