# ADMIN_DASHBOARD_FULL_SYSTEM_GUIDE

Status: As-built implementation guide plus next-phase expansion plan  
Applies to: `C:\realestatesite`  
Primary audience: backend/frontend engineers, QA, and operators

---

## Table of Contents

1. Page 01 - Purpose, Audience, and Reading Order
2. Page 02 - System Scope and Product Boundaries
3. Page 03 - Codebase Map for Admin System
4. Page 04 - Runtime Architecture and Data Flow
5. Page 05 - Auth, Session, and Admin Access Control
6. Page 06 - Admin UI Route Inventory
7. Page 07 - Backend Admin API Inventory
8. Page 08 - Admin Dashboard Metrics and Queries
9. Page 09 - Listing Queue and Lifecycle Management
10. Page 10 - Listing Review Screen and Approval Checklist
11. Page 11 - Inquiry Management Workflow
12. Page 12 - User Management Workflow
13. Page 13 - Email Hub and Template Management
14. Page 14 - Privacy and Fail-Closed Rules
15. Page 15 - Error Handling and Operational Failure Modes
16. Page 16 - Owner Dashboard Dependencies and Coupling
17. Page 17 - Known Gaps and Technical Debt
18. Page 18 - Test and Validation Strategy
19. Page 19 - Extension Playbook for New Admin Features
20. Page 20 - Runbook: Start, Login, Verify, Escalate

---

## Page 01 - Purpose, Audience, and Reading Order

This document explains the implemented admin dashboard system end to end so another engineer can continue work with minimal discovery.

Who should use this:
- Engineers adding admin features
- Engineers debugging admin behavior
- QA building test cases
- Operators doing local smoke tests

Recommended reading order:
1. Page 02 to understand boundaries
2. Page 04 to understand data flow
3. Page 07 for API behavior
4. Page 08 to Page 13 for feature-by-feature implementation
5. Page 17 and Page 20 before deployment or handoff

---

## Page 02 - System Scope and Product Boundaries

### In Scope
- Admin overview dashboard
- Listing queue management (`approve`, `reject`, `unpublish`, `archive`)
- Inquiry management (`new`, `contacted`, `closed`, `spam`)
- User management (`role`, `is_active`, `full_name`)
- Email logs, compose, and template editing
- Admin settings screen

### Out of Scope (Current)
- Payment and billing admin controls
- Team hierarchy / multi-role admin permissions beyond `admin`
- Owner inquiry disclosure workflow
- Advanced analytics/BI exports
- Bulk actions for listings/inquiries

### Hard Product Rules
- Public listing APIs return approved listings only.
- Public listing payload must not expose owner private fields.
- Admin lifecycle actions are admin-only.
- Rejection requires a note.
- Approval requires configured business phone and, by default, at least one image.

---

## Page 03 - Codebase Map for Admin System

### Backend
- `app/backend/app/routes/admin.py`: admin API entrypoint
- `app/backend/app/main.py`: router inclusion, startup seed admin, static image mount
- `app/backend/app/models/entities.py`: persisted entities for listings, inquiries, email, users
- `app/backend/app/services/email_service.py`: admin-facing email send and stats dependencies

### Frontend
- `nextjs-frontend/src/lib/admin-api.ts`: admin typed API client
- `nextjs-frontend/src/app/admin/layout.tsx`: admin route guard + navigation
- `nextjs-frontend/src/app/admin/page.tsx`: overview dashboard
- `nextjs-frontend/src/app/admin/properties/page.tsx`: queue and quick actions
- `nextjs-frontend/src/app/admin/properties/[id]/page.tsx`: review and lifecycle actions
- `nextjs-frontend/src/app/admin/inquiries/page.tsx`: inquiry state transitions
- `nextjs-frontend/src/app/admin/users/page.tsx`: user edits
- `nextjs-frontend/src/app/admin/email-hub/page.tsx`: email logs and stats
- `nextjs-frontend/src/app/admin/email-hub/compose/page.tsx`: manual send
- `nextjs-frontend/src/app/admin/email-hub/templates/page.tsx`: template editor
- `nextjs-frontend/src/app/admin/settings/page.tsx`: operational status

### Contract/Docs
- `real-estate-docs/05-contracts/API_CONTRACTS.md`
- `real-estate-docs/05-contracts/UI_ROUTE_MAP.md`
- `real-estate-docs/04-features/FEATURE_ADMIN_DASHBOARD.md`

---

## Page 04 - Runtime Architecture and Data Flow

```text
Browser (Next.js app routes)
  -> admin-api.ts typed fetch layer
  -> FastAPI /admin/* endpoints
  -> SQLAlchemy (AsyncSession)
  -> SQLite (realestate_mvp_v1.db)
```

### Request model
1. Admin opens `/admin/*`.
2. `admin/layout.tsx` checks local auth session.
3. Layout calls `/auth/me` to verify `role === "admin"`.
4. Page-level component calls `admin-api.ts`.
5. Backend `require_admin` dependency enforces server-side authorization.
6. Response shapes drive UI rendering.

### Database write pattern
- Listing lifecycle writes listing row updates + audit log row.
- Inquiry status updates write inquiry row updates.
- User edits write user row updates.
- Email send writes email log rows.

---

## Page 05 - Auth, Session, and Admin Access Control

### Session keys
- `localStorage`: `realestate_auth_user`
- cookie: `realestate_auth`

### Guard behavior in `admin/layout.tsx`
- No token: redirect `/auth/login`
- Invalid token or `/auth/me` fail: clear session and redirect `/auth/login`
- Non-admin role: redirect `/dashboard`
- Admin role: allow page rendering

### Current login caveat
- Login page redirects to `/dashboard` on success.
- This repo currently has no `/dashboard` root page, so direct admin access should be `/admin`.

### Seed admin credentials (local boot default)
```text
email: admin@realestate.com
password: Admin12345!
```

---

## Page 06 - Admin UI Route Inventory

### Implemented routes
- `/admin`
- `/admin/properties`
- `/admin/properties/[id]`
- `/admin/inquiries`
- `/admin/users`
- `/admin/email-hub`
- `/admin/email-hub/compose`
- `/admin/email-hub/templates`
- `/admin/settings`

### Admin navigation ownership
All admin navigation is implemented in `src/app/admin/layout.tsx`.  
When adding routes, update this nav first to keep discoverability consistent.

---

## Page 07 - Backend Admin API Inventory

All routes below require `require_admin` and are mounted under `/admin`.

### Properties
```text
GET    /admin/properties
GET    /admin/properties/stats
GET    /admin/properties/{listing_id}
PATCH  /admin/properties/{listing_id}
POST   /admin/properties/{listing_id}/approve
POST   /admin/properties/{listing_id}/reject
POST   /admin/properties/{listing_id}/unpublish
POST   /admin/properties/{listing_id}/archive
```

### Inquiries
```text
GET    /admin/inquiries
GET    /admin/inquiries/{inquiry_id}
PATCH  /admin/inquiries/{inquiry_id}
POST   /admin/inquiries/{inquiry_id}/mark-contacted
POST   /admin/inquiries/{inquiry_id}/mark-closed
POST   /admin/inquiries/{inquiry_id}/mark-spam
```

### Users
```text
GET    /admin/users
PATCH  /admin/users/{user_id}
```

### Email
```text
GET    /admin/email/logs
GET    /admin/email/logs/{log_id}/content
GET    /admin/email/user/{email}/history
POST   /admin/email/send
GET    /admin/email/server-stats
GET    /admin/email/templates
PUT    /admin/email/templates/{template_id}
```

### Migration diagnostics (admin-only)
```text
GET    /admin/migration/v2-status
GET    /admin/migration/legacy-candidates
```

---

## Page 08 - Admin Dashboard Metrics and Queries

Overview metrics page calls:
```text
GET /admin/properties/stats
GET /admin/properties?status=pending_review&page_size=5
GET /admin/inquiries?status=new&page_size=5
```

### Stats payload keys
- `pending_review`
- `approved`
- `rejected`
- `unpublished`
- `archived`
- `draft`
- `new_inquiries`
- `total_users`
- `emails_sent_today`

### Backend query behavior
- Listing counts are grouped by explicit status list.
- `new_inquiries` is count of inquiries where status is `new`.
- `emails_sent_today` is computed from `EmailLog.created_at >= today_start`.

---

## Page 09 - Listing Queue and Lifecycle Management

### Queue page behavior
Route: `/admin/properties`

Client API:
```ts
fetchAdminListings("status=pending_review")
```

Filters currently supported in UI:
- status
- listing purpose
- property type
- city
- area
- owner email
- keyword

### Quick actions
From queue row:
- Approve
- Reject (prompt note)
- Unpublish (optional note)
- Archive
- Review (open detail route)

### Backend lifecycle actions
`approve`:
- Validates `REAL_ESTATE_PUBLIC_PHONE` is present.
- If configured, validates listing has image.
- Sets `status=approved`, `approved_at`, `published_at`, `approved_by_user_id`.
- Writes audit action `approved`.
- Sends owner notification email.

`reject`:
- Requires note.
- Sets `status=rejected`, `admin_note`, `rejected_at`.
- Writes audit action `rejected`.
- Sends owner rejection email.

`unpublish`:
- Sets `status=unpublished`, `unpublished_at`, optional note.
- Writes audit action `unpublished`.
- Sends owner unpublish email.

`archive`:
- Sets `status=archived`.
- Writes audit action `archived`.

---

## Page 10 - Listing Review Screen and Approval Checklist

Route: `/admin/properties/[id]`

Data source:
```text
GET /admin/properties/{listing_id}
```

### Screen sections
- Listing facts
- Description
- Admin note input
- Lifecycle action buttons
- Owner info
- Images list
- Audit trail

### As-built checklist mapping (manual operator checklist)
- Title present and meaningful
- Description meaningful
- Location fields present
- Price valid or call-for-price behavior
- Image count >= 1 for approval
- Public business phone configured
- No private owner data exposed publicly

### Lifecycle writes from review screen
Uses same endpoints as queue quick actions.

---

## Page 11 - Inquiry Management Workflow

Route: `/admin/inquiries`

Primary API:
```text
GET /admin/inquiries?status=new
POST /admin/inquiries/{id}/mark-contacted
POST /admin/inquiries/{id}/mark-closed
POST /admin/inquiries/{id}/mark-spam
```

### Inquiry statuses
- `new`
- `contacted`
- `closed`
- `spam`

### UI behavior
- Status filter dropdown
- List card per inquiry with listing context
- Action buttons for state transition
- Link to related listing review

### Backend behavior
- Status mutation endpoint validates allowed statuses.
- Updated row is returned with listing title + slug join data.

---

## Page 12 - User Management Workflow

Route: `/admin/users`

Primary API:
```text
GET   /admin/users
PATCH /admin/users/{user_id}
```

Editable fields:
- `full_name`
- `role` (`client` or `admin`)
- `is_active`

### UI behavior
- Inline editable table rows
- Save per row
- Full table reload after each save

### Backend validation
- Rejects invalid role values.
- Returns updated user row.

---

## Page 13 - Email Hub and Template Management

### Email Hub
Route: `/admin/email-hub`

APIs:
```text
GET /admin/email/server-stats
GET /admin/email/logs
```

Data shown:
- provider
- emails sent today
- log list (`to_email`, `subject`, `sender_type`, `status`, timestamp)

### Compose
Route: `/admin/email-hub/compose`

API:
```text
POST /admin/email/send
```

Payload:
```json
{
  "to_email": "user@example.com",
  "subject": "Subject",
  "body": "Message",
  "sender_type": "admin"
}
```

### Templates
Route: `/admin/email-hub/templates`

APIs:
```text
GET /admin/email/templates
PUT /admin/email/templates/{template_id}
```

Editable fields:
- `subject`
- `body`

---

## Page 14 - Privacy and Fail-Closed Rules

### Privacy boundary
Public listing endpoints must never include:
- owner email
- owner phone
- owner user id
- private address fields
- admin notes
- audit log internals

### Fail-closed checks in admin behavior
- Approval blocks when `REAL_ESTATE_PUBLIC_PHONE` empty.
- Approval blocks when image requirement is enabled and image count is zero.
- Reject blocks when note is missing.
- Admin router blocks non-admin requesters.

### Documentation rule
If any admin API shape or auth rule changes, update:
- `API_CONTRACTS.md`
- `UI_ROUTE_MAP.md`
- this guide

---

## Page 15 - Error Handling and Operational Failure Modes

### Backend exception strategy
Global exception handler returns:
```json
{ "detail": "Internal server error" }
```
while logging full traceback.

### Common failure modes
1. Login redirects to `/dashboard` 404:
- Cause: no `/dashboard` root route implemented.
- Operational workaround: open `/admin` directly after sign-in.

2. SQLite lock/disk I/O during tests:
- Usually process contention or stale temp test cache folders.
- Run tests sequentially and ensure no stray test processes.

3. Approval fails unexpectedly:
- Check business phone env.
- Check listing image count.

### Frontend error pattern
Admin pages wrap API calls in `try/catch` and show inline error message.

---

## Page 16 - Owner Dashboard Dependencies and Coupling

Admin flow depends on owner flow quality.  
If owner flow is broken, admin queue will appear empty or low-quality.

### Owner surfaces impacting admin
- `/dashboard/listings/new` create/update/submit path
- `/dashboard/listings` delete/archive operations
- `property-api.ts` owner endpoint wrappers

### As-built owner integration
- Owner create/update routes are wired.
- Owner submit route is wired.
- Owner delete route is wired.
- Frontend image upload remains placeholder (backend endpoint exists).

### Implication
Approval queue quality remains dependent on final owner image upload UI completion.

---

## Page 17 - Known Gaps and Technical Debt

1. Login redirect target mismatch:
- Current login success path points to `/dashboard`.
- Recommended update: role-aware redirect to `/admin` for admins.

2. Owner image upload UI not wired:
- Backend supports image create via metadata endpoint.
- Frontend still placeholder.

3. No bulk admin actions:
- Queue actions are one listing at a time.

4. Admin settings page is informational only:
- No writable operational toggles yet.

5. No advanced admin analytics:
- Current metrics are operational counts only.

---

## Page 18 - Test and Validation Strategy

### Backend tests
Command:
```powershell
cd C:\realestatesite\app\backend
python -m pytest -q
```

Current result after implementation:
```text
8 passed
```

### Frontend build validation
Command:
```powershell
cd C:\realestatesite\nextjs-frontend
npm run build
```

Build must succeed with admin routes included.

### Manual smoke (admin)
1. Open `/auth/login`
2. Login as admin
3. Open `/admin`
4. Open `/admin/properties`
5. Approve or reject a listing
6. Open `/admin/inquiries` and transition one inquiry status
7. Open `/admin/users` and update one user field
8. Open `/admin/email-hub` and verify logs/stats
9. Open `/admin/email-hub/templates` and save one template edit

---

## Page 19 - Extension Playbook for New Admin Features

### Safe implementation sequence
1. Add backend endpoint in `admin.py` with `require_admin`.
2. Add response field(s) to typed `admin-api.ts`.
3. Add UI route/component under `src/app/admin/*`.
4. Add/extend docs contracts.
5. Add/extend backend tests.
6. Build and smoke.

### Example: Add bulk approve
Backend:
```python
@router.post("/properties/bulk-approve")
async def bulk_approve(payload: BulkApproveRequest, ...):
    ...
```

Frontend API:
```ts
export function bulkApprove(ids: number[]) {
  return adminJson("/admin/properties/bulk-approve", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}
```

UI:
- Add multi-select checkboxes in `/admin/properties`.
- Add confirmation modal.

### Design constraint
Every admin write action must stay auditable and fail-closed.

---

## Page 20 - Runbook: Start, Login, Verify, Escalate

### Start backend
```powershell
cd C:\realestatesite\app\backend
$env:DATABASE_URL='sqlite+aiosqlite:///./realestate_mvp_v1.db'
$env:EMAIL_PROVIDER='console'
$env:REAL_ESTATE_PUBLIC_PHONE='+8801712345678'
python -m uvicorn app.main:app --host 127.0.0.1 --port 8090
```

### Start frontend
```powershell
cd C:\realestatesite\nextjs-frontend
$env:NEXT_PUBLIC_API_URL='http://127.0.0.1:8090'
npm run dev -- --port 3010
```

### Login
```text
http://127.0.0.1:3010/auth/login
email: admin@realestate.com
password: Admin12345!
```

If redirected to `/dashboard` and you hit 404, open:
```text
http://127.0.0.1:3010/admin
```

### Fast health checks
```text
GET http://127.0.0.1:8090/health
GET http://127.0.0.1:8090/health/email
```

### Escalation checklist
- If admin pages fail to load: verify auth token and `/auth/me`.
- If approvals fail: verify public phone env and listing images.
- If tests fail with sqlite lock: stop stray Python processes and rerun sequentially.
- If contracts drift: update contract docs in same change-set.

---

## Appendix A - Core Admin API Client Snippets

```ts
export function fetchAdminStats() {
  return adminJson<AdminStats>("/admin/properties/stats");
}

export function fetchAdminListings(query = "status=pending_review") {
  return adminJson<AdminListResponse<AdminListing>>(`/admin/properties?${query}`);
}

export function approveListing(id: number) {
  return adminJson<{ id: number; status: string }>(`/admin/properties/${id}/approve`, { method: "POST" });
}
```

```ts
export function fetchAdminInquiries(query = "status=new") {
  return adminJson<AdminListResponse<AdminInquiry>>(`/admin/inquiries?${query}`);
}

export function updateInquiryStatus(id: number, status: "contacted" | "closed" | "spam") {
  return adminJson<AdminInquiry>(`/admin/inquiries/${id}/mark-${status}`, { method: "POST" });
}
```

---

## Appendix B - Core Backend Lifecycle Snippets

```python
@router.post("/properties/{listing_id}/approve")
async def admin_approve(listing_id: int, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    if not settings.real_estate_public_phone.strip():
        raise HTTPException(status_code=400, detail="REAL_ESTATE_PUBLIC_PHONE is required before approval")
    ...
```

```python
@router.post("/properties/{listing_id}/reject")
async def admin_reject(listing_id: int, payload: AdminNoteRequest, ...):
    if not payload.note:
        raise HTTPException(status_code=400, detail="Rejection note required")
    ...
```

```python
@router.post("/inquiries/{inquiry_id}/mark-contacted")
async def mark_contacted(inquiry_id: int, db: AsyncSession = Depends(get_db)):
    return await admin_inquiry_patch(inquiry_id, InquiryStatusPatch(status="contacted"), db)
```

---

## Appendix C - Immediate Next Iteration Backlog

1. Implement role-aware post-login redirect:
- admin -> `/admin`
- client -> `/dashboard/listings`

2. Complete owner image uploader UI against `/properties/me/{listing_id}/images`.

3. Add admin list pagination controls for large datasets.

4. Add bulk lifecycle actions with audit guarantees.

5. Add admin action event stream dashboard card (24h activity).
