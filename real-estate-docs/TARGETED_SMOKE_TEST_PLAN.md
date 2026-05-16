# TARGETED_SMOKE_TEST_PLAN (10-Page Breakdown)

Status: Finalized Smoke Test Specification  
Applies to: `C:\realestatesite`  
Scope: Public Search, Inquiry Submission, Auth/Dashboard Flows

---

## Page 01 - Objective and Test Philosophy
The goal of this smoke test is to verify the core functional loop of the Real Estate MVP after the Bproperty merged listing integration. We focus on "happy paths" that represent 90% of user value.

### Principles:
1. **Zero-Trust UI:** Verify the UI reflects backend reality.
2. **Privacy First:** Ensure owner data is NEVER leaked in search or details.
3. **Audit Readiness:** Every state change must leave a trail.

---

## Page 02 - Environment and Prerequisites
- **Backend:** Port 8090, `realestate_mvp_v1.db`.
- **Frontend:** Port 3010.
- **Data:** Merged listings from Bproperty must be present.
- **Admin User:** `admin@realestate.com` / `Admin12345!`.

---

## Page 03 - Public Search Filters (Setup)
**Feature 1: Multi-Criteria Filter against Merged Listings.**
- Navigate to `/`.
- Verify Hero Search Widget renders.
- Identify "Sale" and "Rent" toggles.

---

## Page 04 - Public Search (Execution - Purpose & Type)
1. **Test Case: Filter by Sale.**
   - Click "Buy".
   - Verify URL contains `purpose=sale`.
   - Verify listing cards show only "For Sale" (Price in BDT millions/crores).
2. **Test Case: Filter by Property Type.**
   - Select "Apartment".
   - Verify result set consists exclusively of apartments.

---

## Page 05 - Public Search (Execution - Location)
1. **Test Case: Area-Specific Search.**
   - Enter "Gulshan" in the search box.
   - Verify results are constrained to Gulshan.
   - Click a result and verify "Area" fact matches.

---

## Page 06 - Inquiry Submission (Setup)
**Feature 2: Visitor-to-Admin Lead Generation.**
- Identify an approved merged listing.
- Open its detail page (`/properties/[slug]`).
- Verify inquiry form is present on the sidebar.

---

## Page 07 - Inquiry Submission (Execution)
1. **Test Case: Submit Inquiry.**
   - Fill "Name", "Phone", "Email", and "Message".
   - Submit the form.
   - Verify success message: "Inquiry submitted".
   - **Verification:** Check backend terminal for `console` email log.

---

## Page 08 - Auth Flows (Register & Login)
1. **Test Case: Client Registration.**
   - Navigate to `/auth/register`.
   - Create a new user.
   - Verify redirect to `/dashboard/listings`.
2. **Test Case: Admin Login.**
   - Login as `admin@realestate.com`.
   - Verify role-aware redirect to `/admin`.

---

## Page 09 - Dashboard Flows (Admin Overview)
1. **Test Case: Dashboard Metrics.**
   - Verify "Total Users" count increased after registration test.
   - Verify "New Inquiries" count increased after inquiry test.
2. **Test Case: 24h Event Stream.**
   - Verify your recent actions (approval/unpublish) appear in the stream.

---

## Page 10 - Dashboard Flows (Listing Management)
1. **Test Case: Listing Approval.**
   - Navigate to `/admin/properties`.
   - Find a "Pending" listing.
   - Click "Approve".
   - Verify status transitions to "APPROVED".
   - Verify listing now appears in Public Search.
