# CUSTOMER_USER_DASHBOARD_PRODUCTION_PLAN

Status: implementation-ready production plan  
Applies to: `C:\realestatesite`  
Primary target: customer/listing-owner dashboard plus auth/admin crossover  
Date: 2026-05-16  
Language: English

---

## Table Of Contents

1. Page 01 - Executive Summary And Production Goal
2. Page 02 - Current State From Repo Inspection
3. Page 03 - Non-Breaking Rules And Product Boundaries
4. Page 04 - Auth State And Session Contract
5. Page 05 - Navbar Login-To-Dashboard Button Switch
6. Page 06 - Route Inventory And Missing Pages
7. Page 07 - Dashboard Layout Guard And Navigation
8. Page 08 - `/dashboard` Overview Page
9. Page 09 - Dashboard Metrics And Backend Summary API
10. Page 10 - `/dashboard/listings` List Hardening
11. Page 11 - Listing Status Matrix And Next Actions
12. Page 12 - Create Listing Flow Hardening
13. Page 13 - Edit Listing Route Migration
14. Page 14 - Image Upload Production Details
15. Page 15 - Submit For Review Flow
16. Page 16 - Rejection Feedback And Resubmission Flow
17. Page 17 - Approved Listing Edit And Re-Review Flow
18. Page 18 - Archive, Delete, And Unpublish UX Rules
19. Page 19 - Profile Page Plan
20. Page 20 - Settings Page Plan
21. Page 21 - Customer Inquiry Visibility Plan
22. Page 22 - Admin Dashboard Crossover
23. Page 23 - API Contract Changes Needed
24. Page 24 - Frontend Code Change Map
25. Page 25 - Backend Code Change Map
26. Page 26 - Security And Privacy Hardening
27. Page 27 - 10k-User Scalability Plan
28. Page 28 - Error Handling, Empty States, And Accessibility
29. Page 29 - Automated And Manual Test Plan
30. Page 30 - Implementation Phases, Rollback, And Definition Of Done

---

## Page 01 - Executive Summary And Production Goal

### Goal

Finish the current customer/user dashboard so the real estate MVP is production-ready for listing owners. A client must be able to sign up, log in, open a dashboard, create and edit their own listings, upload images, submit for admin review, track approval status, read admin feedback, and recover cleanly from expired or invalid auth state.

The completed customer flow must be:

```text
Visitor -> signup/login -> customer dashboard -> create listing draft -> upload images -> submit for review -> admin approve/reject -> owner sees status -> approved listing becomes public
```

### Production-ready definition

Production-ready means the existing dashboard works completely and safely for the MVP product, not that every future SaaS feature exists.

- Logged-out visitors see `Sign In / Sign Up` in the Navbar.
- Logged-in clients see `Dashboard` in the Navbar.
- Logged-in admins see `Admin Dashboard` in the Navbar.
- `/dashboard` no longer returns 404.
- All customer dashboard routes are auth-protected.
- Admin users are redirected to `/admin` when they enter customer dashboard routes.
- Clients can manage only their own listings.
- Each listing status shows an accurate next action.
- Rejected listings show admin feedback to the owner only.
- Public pages never expose owner private data or admin notes.
- Dashboard overview and listing pages are pagination/summary ready for 10k users.

### Primary current gap

The backend owner listing lifecycle is mostly implemented, but the dashboard frontend is incomplete:

- Missing `/dashboard` root page.
- Missing `/dashboard/profile`.
- Missing `/dashboard/settings`.
- Missing `/dashboard/inquiries`.
- Navbar always shows `Sign In / Sign Up`.
- Register stores token with `user: null` and redirects to `/dashboard`, which currently 404s.
- Login redirects clients to `/dashboard/listings`, while docs say new users go to `/dashboard`.
- Edit uses `/dashboard/listings/new?id=...`, while docs require `/dashboard/listings/[id]/edit`.

### Final user-visible result

After implementation:

1. Visitor opens homepage and sees `Sign In / Sign Up`.
2. Visitor registers as a client.
3. Client redirects to `/dashboard`.
4. Navbar changes to `Dashboard`.
5. Client creates a listing draft.
6. Client uploads at least one image.
7. Client submits listing for review.
8. Admin approves or rejects.
9. Client sees updated listing status and next action.
10. Approved listing appears publicly with business contact only.

---

## Page 02 - Current State From Repo Inspection

### Source docs

Implementation must stay aligned with:

- `real-estate-docs/PROJECT_MASTER_RULES.md`
- `real-estate-docs/AGENTS.md`
- `real-estate-docs/04-features/FEATURE_CLIENT_DASHBOARD.md`
- `real-estate-docs/04-features/FEATURE_AUTH.md`
- `real-estate-docs/04-features/FEATURE_ADMIN_DASHBOARD.md`
- `real-estate-docs/05-contracts/API_CONTRACTS.md`
- `real-estate-docs/05-contracts/STORAGE_CONTRACTS.md`
- `real-estate-docs/05-contracts/UI_ROUTE_MAP.md`
- `real-estate-docs/03-development/TESTING_PLAYBOOK.md`
- `real-estate-docs/00-governance/DEFINITION_OF_DONE.md`

### Current frontend files

```text
nextjs-frontend/src/lib/auth.ts
nextjs-frontend/src/lib/api.ts
nextjs-frontend/src/lib/property-api.ts
nextjs-frontend/src/lib/admin-api.ts
nextjs-frontend/src/components/layout/Navbar.tsx
nextjs-frontend/src/app/auth/login/page.tsx
nextjs-frontend/src/app/auth/register/page.tsx
nextjs-frontend/src/app/dashboard/layout.tsx
nextjs-frontend/src/app/dashboard/listings/page.tsx
nextjs-frontend/src/app/dashboard/listings/new/page.tsx
nextjs-frontend/src/components/property/ListingImageUploader.tsx
nextjs-frontend/src/app/admin/layout.tsx
nextjs-frontend/src/app/admin/page.tsx
```

### Current backend files

```text
app/backend/app/routes/auth.py
app/backend/app/routes/properties.py
app/backend/app/routes/admin.py
app/backend/app/core/deps.py
app/backend/app/schemas/auth.py
app/backend/app/schemas/properties.py
app/backend/app/models/entities.py
app/backend/app/db/bootstrap.py
```

### Current working behavior

- `POST /auth/register` creates client users.
- `POST /auth/login` returns JWT access token.
- `GET /auth/me` returns current user.
- `GET /properties/me` returns signed-in user's own listings.
- `POST /properties` creates a listing for the current user.
- `GET /properties/me/{listing_id}` is owner-scoped.
- `PUT /properties/me/{listing_id}` updates owner listing when status allows.
- `POST /properties/me/{listing_id}/submit` submits for review.
- `GET /properties/me/{listing_id}/images` lists owner listing images.
- `POST /properties/me/{listing_id}/upload-image` uploads an image file.
- `DELETE /properties/me/{listing_id}/images/{image_id}` deletes image.
- `DELETE /properties/me/{listing_id}` deletes or archives based on status.
- Admin approval/rejection/unpublish/archive flow exists.
- Admin dashboard routes exist and use `role === "admin"` checks.

### Current known dashboard gaps

- `dashboard/layout.tsx` displays name from localStorage but does not validate `/auth/me`.
- `dashboard/listings/page.tsx` performs page-level auth redirect, but guard should live in layout.
- `dashboard/listings/page.tsx` shows some invalid actions for statuses.
- `dashboard/listings/new/page.tsx` mixes create and edit.
- `ListingImageUploader` needs production polish and explicit button types.
- Profile/settings/inquiries routes are missing.
- Navbar auth state is static.

---

## Page 03 - Non-Breaking Rules And Product Boundaries

### Absolute rules

- Do not edit `C:\ClearlyHired`.
- Work only in `C:\realestatesite`.
- Keep backend port `8090`.
- Keep frontend port `3010`.
- Keep canonical DB `realestate_mvp_v1.db`.
- Public APIs return approved listings only.
- Public listing payload excludes owner private fields and admin notes.
- Admin approval is required before publication.
- Billing/subscription/job/resume/team flows remain out of scope.
- Do not commit or push without explicit user permission.

### Product boundary

The customer dashboard is listing-owner centered:

- Own listing management.
- Draft creation.
- Image upload.
- Review submission.
- Listing status tracking.
- Admin feedback visibility.
- Profile/settings basics.
- Inquiry visibility only if owner inquiry exposure is explicitly approved.

### Non-breaking implementation sequence

1. Reuse current APIs first.
2. Add missing pages without changing backend contracts.
3. Add shared auth state and route guards.
4. Add dedicated edit route while keeping `new?id=...` temporarily functional.
5. Add backend summary/pagination after frontend shell is stable.
6. Update contracts only when endpoint or route behavior changes.

### Do not do

- Do not expose buyer inquiry phone/email to owners without a product/legal decision.
- Do not add billing UI.
- Do not use admin endpoints inside client dashboard.
- Do not remove existing admin dashboard routes.
- Do not manually edit the SQLite DB file.

---

## Page 04 - Auth State And Session Contract

### Current storage contract

```text
localStorage key: realestate_auth_user
cookie key: realestate_auth
```

Current shape:

```ts
export type AuthUser = {
  id: number;
  email: string;
  role: string;
  full_name?: string | null;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user?: AuthUser | null;
};
```

### Required auth behavior

Shared frontend auth must:

1. Read `realestate_auth_user`.
2. Treat missing token as logged out.
3. Call `/auth/me` when token exists.
4. Clear localStorage and cookie if `/auth/me` fails.
5. Store fresh user info after successful `/auth/me`.
6. Expose role-aware destination: `/dashboard` for client, `/admin` for admin.

### Add hook

Create:

```text
nextjs-frontend/src/lib/use-auth-session.ts
```

Recommended code:

```ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth";

type AuthState = {
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  dashboardHref: string;
  refresh: () => Promise<AuthSession | null>;
  logout: () => void;
};

export function useAuthSession(): AuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  const refresh = useCallback(async () => {
    const current = getAuthSession();
    if (!current?.access_token) {
      setSession(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${current.access_token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("auth_check_failed");
      const user = (await res.json()) as AuthUser;
      const next = { ...current, user };
      setAuthSession(next);
      setSession(next);
      setLoading(false);
      return next;
    } catch {
      clearAuthSession();
      setSession(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const user = session?.user || null;
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      loading,
      session,
      user,
      isAuthenticated: Boolean(session?.access_token),
      isAdmin,
      dashboardHref: isAdmin ? "/admin" : "/dashboard",
      refresh,
      logout: clearAuthSession,
    }),
    [loading, session, user, isAdmin, refresh],
  );
}
```

### Update cookie lifetime

In `auth.ts`, change:

```ts
window.document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; samesite=lax`;
```

To:

```ts
window.document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; max-age=86400; samesite=lax`;
```

Do not store JWT in the readable cookie. Keep token in current localStorage contract for this pass.

---

## Page 05 - Navbar Login-To-Dashboard Button Switch

### Current problem

`Navbar.tsx` always renders `Sign In / Sign Up`.

### Required states

```text
Logged out: Sign In / Sign Up -> /auth/login
Logged in client: Dashboard -> /dashboard
Logged in admin: Admin Dashboard -> /admin
Auth check loading: Account
```

### Code change

Edit:

```text
nextjs-frontend/src/components/layout/Navbar.tsx
```

Use:

```ts
import { useAuthSession } from "@/lib/use-auth-session";
```

Add inside component:

```ts
const { loading, isAuthenticated, isAdmin, dashboardHref } = useAuthSession();
const accountLabel = loading
  ? "Account"
  : isAuthenticated
    ? isAdmin
      ? "Admin Dashboard"
      : "Dashboard"
    : "Sign In / Sign Up";
const accountHref = isAuthenticated ? dashboardHref : "/auth/login";
```

Replace the static account link with:

```tsx
<Link href={accountHref} className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group">
  <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-green">
    {/* keep existing icon */}
  </div>
  <span className="text-[12px] font-black uppercase tracking-widest hidden lg:inline">
    {accountLabel}
  </span>
</Link>
```

### Post Property CTA

Recommended:

```ts
const postPropertyHref = isAuthenticated
  ? isAdmin
    ? "/admin/properties"
    : "/dashboard/listings/new"
  : "/post-property";
```

### Acceptance criteria

- Fresh visitor sees `Sign In / Sign Up`.
- Client login changes label to `Dashboard`.
- Admin login changes label to `Admin Dashboard`.
- Logout changes label back to `Sign In / Sign Up`.
- Invalid token clears session and shows logged-out state.

---

## Page 06 - Route Inventory And Missing Pages

### Contracted routes

```text
/dashboard
/dashboard/listings
/dashboard/listings/new
/dashboard/listings/[id]/edit
/dashboard/inquiries
/dashboard/profile
/dashboard/settings
```

### Current implemented routes

```text
/dashboard/layout.tsx
/dashboard/listings/page.tsx
/dashboard/listings/new/page.tsx
```

### Add route files

```text
nextjs-frontend/src/app/dashboard/page.tsx
nextjs-frontend/src/app/dashboard/listings/[id]/edit/page.tsx
nextjs-frontend/src/app/dashboard/inquiries/page.tsx
nextjs-frontend/src/app/dashboard/profile/page.tsx
nextjs-frontend/src/app/dashboard/settings/page.tsx
```

### Route behavior

`/dashboard`:

- Overview, metrics, recent listings, main next action.

`/dashboard/listings`:

- Full own listing management with status filter and status-safe actions.

`/dashboard/listings/new`:

- Create new draft and upload images after draft exists.

`/dashboard/listings/[id]/edit`:

- Edit existing own listing via `/properties/me/{id}`.

`/dashboard/inquiries`:

- MVP safe placeholder unless owner inquiry visibility is approved.

`/dashboard/profile`:

- Account identity and optional full-name edit.

`/dashboard/settings`:

- Account settings, logout, password reset entry. No billing.

---

## Page 07 - Dashboard Layout Guard And Navigation

### Required layout behavior

`dashboard/layout.tsx` must:

- Validate auth through shared hook.
- Redirect logged-out users to `/auth/login`.
- Clear invalid sessions.
- Redirect admins to `/admin`.
- Render children only after auth check.
- Highlight active nav item.

### Code change

Edit:

```text
nextjs-frontend/src/app/dashboard/layout.tsx
```

Use:

```ts
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/use-auth-session";
```

Guard:

```ts
const router = useRouter();
const pathname = usePathname();
const { loading, user, isAuthenticated, isAdmin, logout } = useAuthSession();

useEffect(() => {
  if (loading) return;
  if (!isAuthenticated) {
    router.replace("/auth/login");
    return;
  }
  if (isAdmin) {
    router.replace("/admin");
  }
}, [loading, isAuthenticated, isAdmin, router]);
```

Loading shell:

```tsx
if (loading || !isAuthenticated || isAdmin) {
  return <div className="min-h-screen bg-gray-50 p-8 text-sm text-gray-600">Checking account access...</div>;
}
```

Navigation:

```ts
const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "My Properties" },
  { href: "/dashboard/listings/new", label: "Post New Property" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];
```

Active rule:

```ts
const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
```

### Important note

Do not rely on Next middleware as the only auth guard because current JWT is in localStorage. Backend authorization remains the true security layer.

---

## Page 08 - `/dashboard` Overview Page

### File to add

```text
nextjs-frontend/src/app/dashboard/page.tsx
```

### Initial data source

Use existing:

```text
GET /properties/me
```

Later replace with:

```text
GET /properties/me/summary
```

### UI sections

- Header: `Dashboard`.
- Metrics: total, draft, pending review, published, rejected, unpublished, archived.
- Primary action card based on highest-priority status.
- Recent listings list with latest 5.
- Admin feedback alert for rejected listings.

### Priority logic

```text
No listings -> Create your first property
Rejected exists -> Fix rejected listings
Draft exists -> Submit drafts for review
Pending exists -> Waiting for admin review
Approved exists -> View public listings
Otherwise -> Review listings
```

### Acceptance criteria

- `/dashboard` no longer 404s.
- Register can redirect to `/dashboard`.
- Overview shows meaningful state for empty and non-empty accounts.
- Admins do not stay on customer dashboard.

---

## Page 09 - Dashboard Metrics And Backend Summary API

### Why needed

For 10k users, dashboard overview must not fetch every listing just to count statuses.

### Add endpoint

```text
GET /properties/me/summary
```

Response:

```json
{
  "total": 12,
  "draft": 2,
  "pending_review": 3,
  "approved": 5,
  "rejected": 1,
  "unpublished": 1,
  "archived": 0,
  "needs_action": 3,
  "recent": []
}
```

### Backend implementation

Edit:

```text
app/backend/app/routes/properties.py
```

Add route before `/{slug}`:

```python
@router.get("/me/summary")
async def my_listing_summary(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        select(PropertyListing.status, func.count(PropertyListing.id))
        .where(PropertyListing.owner_user_id == current_user.id)
        .group_by(PropertyListing.status)
    )
    counts = {status: count for status, count in rows.all()}
    recent_rows = await db.execute(
        select(PropertyListing)
        .where(PropertyListing.owner_user_id == current_user.id)
        .order_by(PropertyListing.updated_at.desc())
        .limit(5)
    )
    recent = []
    for listing in recent_rows.scalars().all():
        item = owner_shape(listing)
        item["next_action"] = _next_action(listing.status)
        recent.append(item)
    return {
        "total": sum(counts.values()),
        "draft": counts.get("draft", 0),
        "pending_review": counts.get("pending_review", 0),
        "approved": counts.get("approved", 0),
        "rejected": counts.get("rejected", 0),
        "unpublished": counts.get("unpublished", 0),
        "archived": counts.get("archived", 0),
        "needs_action": counts.get("draft", 0) + counts.get("rejected", 0) + counts.get("unpublished", 0),
        "recent": recent,
    }
```

### Frontend wrapper

Add to:

```text
nextjs-frontend/src/lib/property-api.ts
```

```ts
export async function fetchOwnerDashboardSummary() {
  const res = await apiFetch("/properties/me/summary", {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error("Failed to load dashboard summary");
  return res.json();
}
```

### Contract update

Add `GET /properties/me/summary` to `API_CONTRACTS.md`.

---

## Page 10 - `/dashboard/listings` List Hardening

### Required improvements

- Use dashboard layout auth guard instead of local-only page guard.
- Add status filter.
- Add pagination once backend supports it.
- Use status-safe actions.
- Link edit to `/dashboard/listings/{id}/edit`.
- Show admin note preview for rejected listings.
- Improve mobile handling.

### Backend pagination change

Enhance:

```text
GET /properties/me
```

To accept:

```text
status
page
page_size
```

Response should include:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0
}
```

### Action matrix

```text
draft: edit, submit, delete
pending_review: view only
approved: view public, edit/resubmit, archive
rejected: view note, edit, submit, delete
unpublished: edit, submit, archive
archived: view only
```

### Acceptance criteria

- Pending listings do not show edit/delete.
- Approved listings show `View Public`.
- Rejected listings show admin feedback.
- Empty state links to create first listing.
- Large listing sets use pagination, not full fetch.

---

## Page 11 - Listing Status Matrix And Next Actions

### Canonical statuses

```text
draft
pending_review
approved
rejected
unpublished
archived
```

### Shared frontend utility

Add:

```text
nextjs-frontend/src/utils/listing-status.ts
```

Content:

```ts
export const LISTING_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Published",
  rejected: "Rejected",
  unpublished: "Unpublished",
  archived: "Archived",
};

export const NEXT_ACTION_LABELS: Record<string, string> = {
  submit_for_review: "Submit for review",
  wait_for_admin_review: "Waiting for admin review",
  view_public_or_edit_and_resubmit: "View public listing or edit and resubmit",
  fix_and_resubmit: "Fix and resubmit",
  edit_and_resubmit: "Edit and resubmit",
  view_only: "View only",
};

export function listingStatusLabel(status?: string) {
  return LISTING_STATUS_LABELS[status || "draft"] || "Needs review";
}

export function nextActionLabel(action?: string) {
  return NEXT_ACTION_LABELS[action || ""] || "Review listing";
}
```

### UI consistency

The same status labels and badge colors must be used on:

- `/dashboard`
- `/dashboard/listings`
- `/dashboard/listings/[id]/edit`
- admin listing detail when applicable

---

## Page 12 - Create Listing Flow Hardening

### Current issue

`Save as Draft` redirects immediately. This makes image upload awkward because images require an existing listing ID.

### Required behavior

- New listing page creates draft first.
- After draft save, stay on editor or route to dedicated edit page.
- Enable image uploader after draft exists.
- `Submit for Review` saves latest fields, then submits.
- Backend errors show inline.

### Code change

In `dashboard/listings/new/page.tsx`, replace unconditional:

```ts
router.push("/dashboard/listings");
```

With behavior:

```ts
if (submitAfter) {
  router.push("/dashboard/listings");
  return;
}

if (!existingId && currentId) {
  setExistingId(currentId);
  setSuccess("Draft saved. You can now upload images.");
  router.replace(`/dashboard/listings/${currentId}/edit`);
  return;
}

setSuccess("Draft updated.");
```

### Validation

Block obvious missing fields before submit:

- title length at least 5.
- description length at least 10.
- city, area, display address required.
- price required unless `call_for_price`.
- land size required for land listings.

### Acceptance criteria

- User can save draft and upload image without leaving workflow.
- Submit changes status to `pending_review`.
- Validation errors stay visible.

---

## Page 13 - Edit Listing Route Migration

### Add route

```text
nextjs-frontend/src/app/dashboard/listings/[id]/edit/page.tsx
```

### Recommended refactor

Extract form into:

```text
nextjs-frontend/src/components/property/ListingEditorForm.tsx
```

Then:

```tsx
// new/page.tsx
export default function NewListingPage() {
  return <ListingEditorForm mode="create" />;
}
```

```tsx
// [id]/edit/page.tsx
export default function EditListingPage({ params }: { params: { id: string } }) {
  return <ListingEditorForm mode="edit" listingId={Number(params.id)} />;
}
```

### Backward compatibility

Keep `/dashboard/listings/new?id=123` working temporarily. New links should use `/dashboard/listings/123/edit`.

### Acceptance criteria

- Direct edit route works.
- Query-param edit route still works during migration.
- Other user's listing cannot be loaded.

---

## Page 14 - Image Upload Production Details

### Current endpoints

```text
GET /properties/me/{listing_id}/images
POST /properties/me/{listing_id}/upload-image
DELETE /properties/me/{listing_id}/images/{image_id}
```

### Required UI fixes

- Show allowed types: `jpg`, `jpeg`, `png`, `webp`.
- Show max size: 5MB.
- Show max count: 10.
- Show image count.
- Disable upload at max count.
- Show backend error detail.
- Add `type="button"` to delete button.

### Client-side validation

```ts
const allowed = ["image/jpeg", "image/png", "image/webp"];
if (!allowed.includes(file.type)) {
  setError("Only JPG, PNG, or WEBP images are supported.");
  return;
}
if (file.size > 5 * 1024 * 1024) {
  setError("Image must be 5MB or smaller.");
  return;
}
```

### Backend hardening later

- Use collision-resistant filenames.
- Validate MIME, not only extension.
- Ensure storage path cannot escape `userdata/property-images`.
- Return consistent image response shape.

### Acceptance criteria

- Upload works after draft creation.
- First image becomes cover.
- Delete does not submit the form.
- Unsupported type and oversized file show clear errors.

---

## Page 15 - Submit For Review Flow

### Backend readiness rules

Existing backend requires:

- title and description.
- city, area, display address.
- price unless `call_for_price`.
- land size for land listings.
- at least one image if image requirement is enabled.

### Frontend requirements

Show checklist:

```text
Required before review:
- Basic title and description
- City, area, display address
- Price or call-for-price
- At least one image
```

For land:

```text
- Land size
```

### Submit sequence

```text
1. Save latest form values.
2. Call POST /properties/me/{id}/submit.
3. On success, redirect to /dashboard/listings.
4. On failure, stay on page and show backend detail.
```

### Acceptance criteria

- Submit moves listing to `pending_review`.
- Pending listing is not public.
- Admin queue receives pending listing.
- Owner sees `Waiting for admin review`.

---

## Page 16 - Rejection Feedback And Resubmission Flow

### Owner visibility

Owner responses include `admin_note`. This is correct for dashboard. Public responses must never include it.

### Dashboard list behavior

Rejected row must show:

- red badge.
- admin note preview.
- `Fix and resubmit`.
- edit link.

### Editor behavior

At top of rejected listing editor:

```text
Admin feedback
[admin_note]
Update the fields below and submit again for review.
```

### Acceptance criteria

- Rejected listing is not public.
- Owner sees rejection note.
- Owner can edit and resubmit.
- Public pages never show admin note.

---

## Page 17 - Approved Listing Edit And Re-Review Flow

### Current backend behavior

Editing approved listing sets status to `pending_review`. This is correct.

### Required warning

Before editing approved listing:

```text
This listing is currently public. If you edit and save it, it will be sent back to admin review and hidden from public search until approved again.
```

### Action labels

For approved listings:

- `View Public`
- `Edit and Resubmit`
- `Archive`

### Acceptance criteria

- Approved listing has public link.
- Editing approved listing hides it from public search until re-approved.
- UI warns before state-changing edit.

---

## Page 18 - Archive, Delete, And Unpublish UX Rules

### Current backend behavior

```text
draft/rejected -> deleted
approved/unpublished -> archived
pending_review -> cannot delete
```

### UI labels

```text
draft: Delete draft
rejected: Delete rejected listing
approved: Archive listing
unpublished: Archive listing
pending_review: no delete/archive button
archived: no write actions
```

### Confirmation copy

Use specific confirmations:

```text
Delete this draft? This cannot be undone.
Archive this public listing? It will no longer be active in your dashboard workflow.
```

### Acceptance criteria

- Pending listings cannot show delete/archive.
- Approved action says Archive.
- Archived listing is view-only.

---

## Page 19 - Profile Page Plan

### Add route

```text
nextjs-frontend/src/app/dashboard/profile/page.tsx
```

### MVP behavior

Show:

- email.
- full name.
- role label `Property Owner`.
- account status if exposed later.

### Optional backend endpoint

```text
PATCH /auth/me
```

Request:

```json
{
  "full_name": "Updated Name"
}
```

### Acceptance criteria

- Route does not 404.
- Current account identity is visible.
- If edit is implemented, updated name appears in layout/Navbar after save.

---

## Page 20 - Settings Page Plan

### Add route

```text
nextjs-frontend/src/app/dashboard/settings/page.tsx
```

### MVP content

- Account email.
- Password reset entry point.
- Logout button.
- Data/privacy note.
- No billing UI.

### Logout behavior

```ts
logout();
router.replace("/auth/login");
```

### Acceptance criteria

- Settings route does not 404.
- Logout clears localStorage and cookie.
- Navbar returns to `Sign In / Sign Up`.
- No subscription/billing UI appears.

---

## Page 21 - Customer Inquiry Visibility Plan

### Current product direction

Inquiries currently route to admin/business. Owner inquiry disclosure is not established as production policy.

### Recommended MVP implementation

Add `/dashboard/inquiries` as a safe page:

```text
Inquiries are currently handled by our property support team. We will contact you if a buyer needs owner-side clarification.
```

### If owner visibility is approved later

Add:

```text
GET /properties/me/inquiries?page=1&page_size=20
```

Do not expose buyer phone/email unless explicitly approved.

### Acceptance criteria

- Route exists.
- No private inquiry fields are leaked.
- Admin inquiry workflow remains unchanged.

---

## Page 22 - Admin Dashboard Crossover

### Why included

Navbar and login behavior must respond correctly for both clients and admins.

### Required behavior

- Client login -> `/dashboard`.
- Admin login -> `/admin`.
- Client opening `/admin` -> `/dashboard`.
- Admin opening `/dashboard` -> `/admin`.
- Navbar label matches role.

### Login page change

In `nextjs-frontend/src/app/auth/login/page.tsx`, client redirect should be:

```ts
if (user?.role === "admin") {
  window.location.href = "/admin";
} else {
  window.location.href = "/dashboard";
}
```

### Register page change

After register token, fetch `/auth/me`:

```ts
const tokenData = await res.json();
const meRes = await apiFetch("/auth/me", {
  headers: { Authorization: `Bearer ${tokenData.access_token}` },
});
const user = meRes.ok ? await meRes.json() : null;
setAuthSession({ ...tokenData, user });
window.location.href = user?.role === "admin" ? "/admin" : "/dashboard";
```

---

## Page 23 - API Contract Changes Needed

### Update docs when code changes

Update:

```text
real-estate-docs/05-contracts/API_CONTRACTS.md
real-estate-docs/05-contracts/UI_ROUTE_MAP.md
real-estate-docs/05-contracts/STORAGE_CONTRACTS.md
real-estate-docs/04-features/FEATURE_CLIENT_DASHBOARD.md
real-estate-docs/02-context/CHANGELOG.md
real-estate-docs/02-context/DECISIONS_LOG.md
```

### Recommended API additions

```text
GET /properties/me/summary
GET /properties/me?page=1&page_size=20&status=draft
PATCH /auth/me
```

### Optional later

```text
GET /properties/me/inquiries?page=1&page_size=20
```

### Existing APIs to preserve

```text
GET /properties/me
POST /properties
GET /properties/me/{listing_id}
PUT /properties/me/{listing_id}
POST /properties/me/{listing_id}/submit
POST /properties/me/{listing_id}/upload-image
GET /properties/me/{listing_id}/images
DELETE /properties/me/{listing_id}/images/{image_id}
DELETE /properties/me/{listing_id}
```

---

## Page 24 - Frontend Code Change Map

### Add files

```text
nextjs-frontend/src/lib/use-auth-session.ts
nextjs-frontend/src/utils/listing-status.ts
nextjs-frontend/src/components/property/ListingEditorForm.tsx
nextjs-frontend/src/app/dashboard/page.tsx
nextjs-frontend/src/app/dashboard/listings/[id]/edit/page.tsx
nextjs-frontend/src/app/dashboard/inquiries/page.tsx
nextjs-frontend/src/app/dashboard/profile/page.tsx
nextjs-frontend/src/app/dashboard/settings/page.tsx
```

### Modify files

```text
nextjs-frontend/src/lib/auth.ts
nextjs-frontend/src/lib/property-api.ts
nextjs-frontend/src/components/layout/Navbar.tsx
nextjs-frontend/src/app/auth/login/page.tsx
nextjs-frontend/src/app/auth/register/page.tsx
nextjs-frontend/src/app/dashboard/layout.tsx
nextjs-frontend/src/app/dashboard/listings/page.tsx
nextjs-frontend/src/app/dashboard/listings/new/page.tsx
nextjs-frontend/src/components/property/ListingImageUploader.tsx
```

### Implementation order

1. Shared auth hook.
2. Navbar auth switch.
3. Dashboard layout guard.
4. `/dashboard` page.
5. Listing status utility.
6. Listings page action cleanup.
7. Listing editor extraction.
8. Dedicated edit route.
9. Profile/settings/inquiries routes.
10. Backend summary/pagination integration.

---

## Page 25 - Backend Code Change Map

### Modify `properties.py`

Add:

```text
GET /properties/me/summary
GET /properties/me pagination and status filter
```

Paginated owner listings:

```python
@router.get("/me")
async def my_listings(
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = [PropertyListing.owner_user_id == current_user.id]
    if status:
        filters.append(PropertyListing.status == status)

    total_res = await db.execute(
        select(func.count()).select_from(PropertyListing).where(and_(*filters))
    )
    total = total_res.scalar_one()

    result = await db.execute(
        select(PropertyListing)
        .where(and_(*filters))
        .order_by(PropertyListing.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    items = []
    for row in result.scalars().all():
        item = owner_shape(row)
        item["next_action"] = _next_action(row.status)
        items.append(item)

    return {"items": items, "page": page, "page_size": page_size, "total": total}
```

### Optional `auth.py` update

Add profile update:

```python
@router.patch("/me", response_model=UserResponse)
async def update_me(payload: UserUpdateRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    await db.commit()
    await db.refresh(current_user)
    return UserResponse(id=current_user.id, email=current_user.email, role=current_user.role, full_name=current_user.full_name)
```

Schema:

```python
class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
```

### Backend tests to add

- Summary counts only current user's listings.
- Status filter scopes to current user.
- Pagination returns `page`, `page_size`, and `total`.
- `PATCH /auth/me` updates only current user if implemented.
- Non-owner cannot access another owner's listing.
- Public property response excludes owner/admin private fields.

---

## Page 26 - Security And Privacy Hardening

### Auth rules

- Frontend guard is UX, not security.
- Backend is the source of truth.
- Invalid token clears frontend session.
- Inactive users should be blocked if `is_active` is false.

### Backend auth hardening

In `get_current_user`, reject inactive users:

```python
if not user or not user.is_active:
    raise credentials_error
```

This matters because admin user management can disable accounts.

### Public privacy rules

Public endpoints must never expose:

- `owner_user_id`
- owner email
- owner phone
- `admin_note`
- `owner_note`
- audit logs
- private address fields

### Customer dashboard visibility

Customer dashboard may show:

- own `owner_note`.
- own `admin_note`.
- own status.
- own draft/private listing fields.

### Session storage risk

JWT in localStorage is acceptable for this MVP pass but is not ideal for mature production. Before a real public launch, plan HttpOnly cookie or short-lived access token architecture separately.

---

## Page 27 - 10k-User Scalability Plan

### Target

Support 10k registered users with predictable dashboard performance. This means avoiding unbounded user/listing reads, not claiming 10k concurrent active users.

### Current scalable foundations

- SQLite-first direction.
- `property_listings.owner_user_id` indexed.
- `property_listings.status` indexed.
- v2 dual-write tables and indexes exist.
- Public/admin query indexes exist in runtime bootstrap.

### Required rules

- Do not fetch all listings for dashboard overview once summary endpoint exists.
- Paginate `/dashboard/listings`.
- Use backend status filters.
- Limit recent dashboard items to 5.
- Keep image requests scoped to one listing.
- Avoid client-side filtering over thousands of rows.

### Recommended composite indexes

```text
property_listings(owner_user_id, updated_at DESC)
property_listings(owner_user_id, status, updated_at DESC)
property_images(listing_id, is_cover DESC, sort_order ASC)
property_audit_logs(listing_id, created_at DESC)
```

### API limits

```text
default page_size: 20
max page_size: 100
summary recent count: 5
image max count: 10
```

### Acceptance criteria

- `/dashboard` performs one summary request.
- `/dashboard/listings` uses pagination.
- Backend tests validate pagination metadata.
- Seeded large listing count still loads dashboard quickly.

---

## Page 28 - Error Handling, Empty States, And Accessibility

### Every dashboard API call needs

- loading state.
- empty state.
- error state.
- retry action where useful.

### Empty copy

`/dashboard`:

```text
No properties yet. Create your first listing and submit it for review.
```

`/dashboard/listings`:

```text
No listings match this status.
```

`/dashboard/inquiries`:

```text
Inquiries are currently handled by our property support team.
```

### Accessibility requirements

- Buttons need clear text or `aria-label`.
- Destructive actions require confirmation.
- Form fields need labels.
- Status badges include text, not color only.
- Loading states are visible text.
- Mobile table is usable through cards or horizontal scroll.

### Common bug to avoid

Any non-submit button inside a form needs:

```tsx
type="button"
```

---

## Page 29 - Automated And Manual Test Plan

### Backend command

```powershell
cd C:\realestatesite\app\backend
python -m pytest -q
```

### Add backend tests

- client registration and `/auth/me`.
- inactive user cannot authenticate after admin disables account.
- owner dashboard summary counts by status.
- owner listing pagination.
- owner status filter.
- owner cannot fetch another owner's listing.
- submit requires image when configured.
- rejected listing exposes admin note to owner.
- rejected listing does not expose admin note publicly.
- approved edit moves listing to pending review.
- public search shows approved only.

### Frontend command

```powershell
cd C:\realestatesite\nextjs-frontend
npm run build
```

If lint is stable:

```powershell
npm run lint
```

### Manual client smoke

1. Start backend on `8090`.
2. Start frontend on `3010`.
3. Open `/`.
4. Confirm Navbar says `Sign In / Sign Up`.
5. Register client.
6. Confirm redirect to `/dashboard`.
7. Confirm Navbar says `Dashboard`.
8. Create draft.
9. Upload image.
10. Submit for review.
11. Confirm status `Pending Review`.
12. Confirm listing is not public.

### Manual admin crossover smoke

1. Login as `admin@realestate.com`.
2. Confirm redirect to `/admin`.
3. Confirm Navbar says `Admin Dashboard`.
4. Reject pending listing with note.
5. Login as client.
6. Confirm rejected listing shows note.
7. Edit and resubmit.
8. Login as admin.
9. Approve listing.
10. Confirm public detail page works.

### Manual logout smoke

1. Login as client.
2. Confirm Navbar says `Dashboard`.
3. Logout.
4. Confirm `realestate_auth_user` removed.
5. Confirm `realestate_auth` cookie removed.
6. Confirm Navbar says `Sign In / Sign Up`.

---

## Page 30 - Implementation Phases, Rollback, And Definition Of Done

### Phase 1 - Auth and route shell

Implement:

- `use-auth-session.ts`.
- Navbar auth-aware button.
- Dashboard layout guard.
- `/dashboard` overview using existing `/properties/me`.
- Register `/auth/me` fetch after token.
- Client login redirect to `/dashboard`.

Verify:

- Client/admin redirects work.
- Navbar switches correctly.
- `/dashboard` does not 404.

### Phase 2 - Customer dashboard completion

Implement:

- status utility.
- listings action matrix.
- editor form extraction.
- dedicated edit route.
- image uploader fixes.
- profile/settings/inquiries pages.

Verify:

- full listing lifecycle works.
- image upload works.
- rejection/resubmission works.

### Phase 3 - Backend summary and scalability

Implement:

- `/properties/me/summary`.
- pagination/status filter on `/properties/me`.
- optional `PATCH /auth/me`.
- owner-scoped indexes if missing.
- tests for summary/pagination/profile.

Verify:

- backend tests pass.
- dashboard uses summary endpoint.
- list page uses pagination.

### Phase 4 - Docs and release hardening

Update:

- `API_CONTRACTS.md`.
- `UI_ROUTE_MAP.md`.
- `FEATURE_CLIENT_DASHBOARD.md`.
- `CHANGELOG.md`.
- `DECISIONS_LOG.md`.

Run:

```powershell
cd C:\realestatesite\app\backend
python -m pytest -q
```

```powershell
cd C:\realestatesite\nextjs-frontend
npm run build
```

### Rollback plan

If frontend breaks:

- Revert only files changed in the current phase.
- Keep docs and backend untouched unless they caused failure.
- Do not run destructive git reset.
- Keep `/dashboard/listings/new?id=...` support until edit route is verified.

If backend summary endpoint breaks:

- Fall back frontend to `/properties/me`.
- Fix endpoint under tests.
- Re-enable summary after tests pass.

### Definition of done

Done only when:

- `/dashboard` works.
- `/dashboard/listings` works.
- `/dashboard/listings/new` works.
- `/dashboard/listings/[id]/edit` works.
- `/dashboard/profile` works.
- `/dashboard/settings` works.
- `/dashboard/inquiries` works safely.
- Navbar switches to `Dashboard` for clients.
- Navbar switches to `Admin Dashboard` for admins.
- Invalid sessions are cleared.
- Admin routes reject clients.
- Customer routes reject logged-out users.
- Clients manage only their own listings.
- Rejected listings show owner-only feedback.
- Public pages never show owner private data or admin notes.
- Dashboard is pagination/summary ready for 10k users.
- Backend tests pass.
- Frontend build passes.
- Manual client-admin-public lifecycle smoke passes.

---

## Appendix A - First Implementation Checklist

1. Add `nextjs-frontend/src/lib/use-auth-session.ts`.
2. Update `Navbar.tsx`.
3. Update register page to fetch `/auth/me`.
4. Update login client redirect to `/dashboard`.
5. Update dashboard layout guard and nav.
6. Add `/dashboard` overview.
7. Add `utils/listing-status.ts`.
8. Update listings action matrix.
9. Add dedicated edit route.
10. Extract listing editor form.
11. Fix image uploader validation and button types.
12. Add profile/settings/inquiries routes.
13. Add backend summary/pagination.
14. Update contracts/changelog/decisions.
15. Run backend tests and frontend build.

## Appendix B - Routes That Must Not 404

```text
/
/properties
/properties/[slug]
/post-property
/auth/login
/auth/register
/dashboard
/dashboard/listings
/dashboard/listings/new
/dashboard/listings/[id]/edit
/dashboard/inquiries
/dashboard/profile
/dashboard/settings
/admin
/admin/properties
/admin/inquiries
/admin/users
/admin/email-hub
/admin/settings
```

## Appendix C - Local Smoke Credentials

```text
email: admin@realestate.com
password: Admin12345!
```

Create a fresh client during smoke tests instead of relying on stale localStorage.

## Appendix D - Worktree Caution

Before implementation:

```powershell
cd C:\realestatesite
git status --short
```

Do not overwrite unrelated backend or DB changes. Scope implementation to the files listed in this plan unless the user explicitly expands scope.
