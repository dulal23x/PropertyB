# ADMIN_DASHBOARD_CODE_PLAN (20-Page Breakdown)

Status: Comprehensive MVP Architecture and Implementation Guide  
Applies to: `C:\realestatesite`

---

## Page 01 - Architecture Overview
The Admin Dashboard is a React/Next.js SPA powered by a FastAPI/SQLAlchemy backend.
- **Auth:** JWT + Role-based access control.
- **Database:** SQLite (realestate_mvp_v1.db).
- **Communication:** Typed Fetch via `admin-api.ts`.

---

## Page 02 - Backend: Directory Structure
- `app/backend/app/routes/admin.py`: Router for all admin ops.
- `app/backend/app/schemas/admin.py`: Pydantic models for admin-only payloads.
- `app/backend/app/core/deps.py`: `require_admin` dependency.

---

## Page 03 - Backend: Core Logic (Listing Approval)
Implementation of `POST /admin/properties/{id}/approve`.
- Check for `REAL_ESTATE_PUBLIC_PHONE`.
- Set `approved_at`, `published_at`, `status=approved`.
- Trigger owner email notification.

---

## Page 04 - Backend: Core Logic (Inquiry Management)
Implementation of `/admin/inquiries` endpoints.
- Support for status filters (new, contacted, closed, spam).
- Join with `PropertyListing` for context (title, slug).

---

## Page 05 - Backend: Core Logic (User Management)
Implementation of `/admin/users` endpoints.
- Allow `role` and `is_active` updates.
- Prevent non-admins from accessing or modifying user lists.

---

## Page 06 - Backend: Email Service Integration
- `EmailLog` entity captures all outbound admin communications.
- `admin_email_server_stats` provides health metrics on the email subsystem.

---

## Page 07 - Backend: Audit Trail Design
- `PropertyAuditLog` table records actor, action, from_status, to_status, and notes.
- Every bulk action must create an audit entry per affected listing.

---

## Page 08 - Backend: Migration Diagnostics
- Admin tools to check drift between Bproperty merged data and MVP schema.
- Endpoints to identify legacy candidate tables for cleanup.

---

## Page 09 - Frontend: Admin Layout and Navigation
- `src/app/admin/layout.tsx` enforces the role guard.
- Sidebar with quick links to Properties, Inquiries, Users, and Email Hub.

---

## Page 10 - Frontend: Overview Dashboard (Page 01)
- Stat cards for total counts.
- Summary tables for "Latest Pending" and "Latest Inquiries".

---

## Page 11 - Frontend: Overview Dashboard (Page 02)
- 24h Activity Stream component.
- Real-time polling or refresh on action for activity logging.

---

## Page 12 - Frontend: Listing Queue (Filtering)
- Multi-input filter bar for `status`, `city`, `area`, `keyword`.
- Debounced search to prevent API spam.

---

## Page 13 - Frontend: Listing Queue (Pagination)
- Client-side state for `page` and `page_size`.
- Backend support for `LIMIT/OFFSET` queries.

---

## Page 14 - Frontend: Bulk Action UI
- Multi-select checkboxes in table rows.
- Dynamic action bar that appears when `selectedIds.length > 0`.

---

## Page 15 - Frontend: Listing Review Screen
- Deep-dive view of a single listing.
- Display of audit logs and owner contact info (visible only to admin).
- Individual action buttons (Approve, Reject, etc.).

---

## Page 16 - Frontend: Inquiry Workflow UI
- Status transition buttons (Mark Contacted, Mark Closed).
- Direct link to the listing the inquiry belongs to.

---

## Page 17 - Frontend: User Management UI
- Inline editing for user roles and activation status.
- Instant feedback on save.

---

## Page 18 - Frontend: Email Hub
- Log viewer with search by `to_email`.
- Compose modal for manual admin-to-user messaging.

---

## Page 19 - Frontend: Template Editor
- Editable subject and body for system emails (Approval, Rejection).
- WYSIWYG or plain text with placeholder support (e.g., `{{title}}`).

---

## Page 20 - Frontend: Stabilization and Error Handling
- Global `ErrorBoundary` for admin routes.
- Centralized error message display for failed API calls.
- Success toast notifications for bulk actions.
