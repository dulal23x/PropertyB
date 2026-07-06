# Real Estate MVP Clone Transformation Plan

**ফাইলের উদ্দেশ্য:** এই Markdown plan-টি পরে আমি বা অন্য কোনো engineer/agent পড়ে `ClearlyHired` clone থেকে একটি MVP real estate listing website সম্পূর্ণ build, verify, test, এবং handoff করতে পারবে।

**গুরুত্বপূর্ণ সীমা:** এই plan তৈরি করতে বর্তমান `C:\ClearlyHired` project modify করা হয়নি এবং implementation-এর সময়ও original project modify করা যাবে না। Original repo হবে reference-only. সব কাজ হবে নতুন clone folder-এ।

**Target product:** Bproperty এবং bdHousing-এর মতো Bangladesh-focused property listing site-এর MVP version: users signup করবে, property/land listing post করবে, listing admin dashboard থেকে review/approve হলে public search/list/detail page-এ দেখা যাবে, public contact number হবে business-এর real estate phone number, client-এর phone number নয়।

**Project name/domain:** পরে নির্ধারণ হবে। Implementation-এ neutral placeholder ব্যবহার হবে।

---

## Page 01 - Core Mission

এই project-এর mission হলো existing ClearlyHired frontend/backend/email/admin foundation reuse করে দ্রুত real estate listing MVP build করা, কিন্তু running ClearlyHired product বা database কোনোভাবেই touch না করা।

Build principle:

- Clone first.
- Isolate environment second.
- Verify auth/admin/email baseline third.
- Build property backend fourth.
- Build dashboard/public frontend fifth.
- Test end-to-end sixth.

MVP-এর must-have:

- Visitor public properties browse/search করতে পারবে।
- Visitor approved listing detail দেখতে পারবে।
- Visitor listing inquiry submit করতে পারবে।
- User signup/login করতে পারবে।
- Logged-in user listing draft create করতে পারবে।
- Logged-in user listing submit করতে পারবে।
- Listing `pending_review` state-এ থাকবে যতক্ষণ admin approve না করে।
- Admin listing review করে approve/reject/unpublish করতে পারবে।
- Public listing-এ owner/client phone দেখানো হবে না।
- Public CTA phone হবে business/company phone.
- Email system signup, listing submit, approval/rejection, inquiry alert log/send করবে।
- Admin dashboard MVP real estate workflow support করবে।

Non-MVP:

- Payment/subscription.
- MLS integration.
- Advanced CRM.
- Live chat.
- Agent marketplace.
- Map polygon search.
- Mobile app.
- Property verification automation.

---

## Page 02 - Absolute Safety Rules

Original repo safety:

- `C:\ClearlyHired` read-only reference.
- কোনো file edit নয়।
- কোনো delete নয়।
- কোনো formatter নয়।
- কোনো migration নয়।
- কোনো DB write নয়।
- কোনো server reload নয়।

Implementation target:

- New folder: `C:\RealEstateMVP`
- Temporary backend port: `8090`
- Temporary frontend port: `3010`
- Temporary DB: `C:\RealEstateMVP\realestate_mvp_v1.db`
- Temporary frontend env API: `http://127.0.0.1:8090`

Hard blockers:

- যদি backend config `clearlyhired_v2.db` point করে, implementation stop.
- যদি frontend API current ClearlyHired backend `8080`-এ point করে, implementation stop.
- যদি email sender still `clearlyhired.com` বা `email.clearlyhired.com` হয়, production send disabled.
- যদি public API owner phone/email expose করে, launch blocked.

---

## Page 03 - Source Truth Already Verified

Existing ClearlyHired source truths from repo inspection:

- Backend source zone: `backend/app/**`
- Frontend source zone: `nextjs-frontend/src/**`
- API truth docs: `docs/05-contracts/API_CONTRACTS.md`
- UI route truth docs: `docs/05-contracts/UI_ROUTE_MAP.md`
- Safe edit docs: `docs/03-development/SAFE_EDIT_ZONES.md`
- Backend app: FastAPI.
- Frontend app: Next.js app router.
- Auth exists: register, login, me, password reset.
- Role exists: client, team_member, team_manager, admin.
- Admin dashboard exists.
- Email service exists: console/smtp provider, DB logs, templates, admin email hub.
- Billing exists but MVP should hide/disable.
- Resume/job/team flows exist but should be hidden or removed after stability.

Reusable systems:

- JWT auth.
- Password hashing.
- Password reset email.
- Admin protected routes.
- Email logs/templates/composer.
- API client wrapper.
- Dashboard shell.
- Admin shell.
- SEO metadata pattern.

---

## Page 04 - Clone And Isolation Procedure

Step 1: Clone to new folder.

```powershell
git clone https://github.com/dulal23x/ClearlyHired.git C:\RealEstateMVP
```

Step 2: Enter clone.

```powershell
cd C:\RealEstateMVP
```

Step 3: Rename original remote to avoid accidental push.

```powershell
git remote rename origin clearlyhired-origin
```

Step 4: Create working branch.

```powershell
git checkout -b real-estate-mvp
```

Step 5: Confirm location.

```powershell
pwd
```

Must output:

```text
C:\RealEstateMVP
```

Step 6: Confirm original repo untouched.

```powershell
git status --short
```

Expected in new clone:

```text
empty output
```

Do not run destructive git commands.

---

## Page 05 - Environment Rename Defaults

Until final name/domain is chosen:

```text
PRODUCT_PLACEHOLDER=RealEstateMVP
PROJECT_NAME=RealEstateMVP API
FRONTEND_URL=http://localhost:3010
BACKEND_PORT=8090
FRONTEND_PORT=3010
DATABASE_FILE=realestate_mvp_v1.db
```

New backend env:

```text
PROJECT_NAME=RealEstateMVP API
PORT=8090
DATABASE_URL=sqlite+aiosqlite:///C:/RealEstateMVP/realestate_mvp_v1.db
FRONTEND_URL=http://localhost:3010
ALLOWED_ORIGINS=http://localhost:3010,http://127.0.0.1:3010
SECRET_KEY=<generate-new-secret>
EMAIL_PROVIDER=console
REAL_ESTATE_PUBLIC_PHONE=+880XXXXXXXXXX
REAL_ESTATE_PUBLIC_EMAIL=info@example.com
REAL_ESTATE_SUPPORT_EMAIL=support@example.com
REAL_ESTATE_ADMIN_ALERT_EMAIL=admin@example.com
```

New frontend env:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8090
NEXT_PUBLIC_PUBLIC_PHONE=+880XXXXXXXXXX
NEXT_PUBLIC_PUBLIC_EMAIL=info@example.com
```

Do not use:

```text
clearlyhired_v2.db
hiremeai_auth_user
hireme_auth
ClearlyHired public branding
old SMTP secrets
old Stripe keys
old live domain
```

---

## Page 06 - Baseline Verification Before Edits

Before transforming features, prove clone can run.

Backend baseline:

```powershell
cd C:\RealEstateMVP\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8090
```

Expected:

- FastAPI starts.
- Health route works.

Health check:

```powershell
Invoke-WebRequest http://127.0.0.1:8090/health
```

Frontend baseline:

```powershell
cd C:\RealEstateMVP\nextjs-frontend
npm run dev -- --port 3010
```

Expected:

- Next.js starts.
- Browser loads `http://localhost:3010`.

If dependency install needed:

```powershell
npm install
```

Baseline pass criteria:

- Backend health returns JSON.
- Frontend loads.
- Auth page renders.
- Admin route redirects if unauthenticated.

---

## Page 07 - Database Isolation Guard

Backend config must be changed so default DB cannot resolve to old ClearlyHired DB.

Required new default:

```text
DEFAULT_DB_PATH = REPO_ROOT / "realestate_mvp_v1.db"
DEFAULT_DB_URL = sqlite+aiosqlite:///{DEFAULT_DB_PATH}
```

Add startup guard in clone:

```text
If DATABASE_URL contains clearlyhired_v2.db:
    raise RuntimeError
If DATABASE_URL contains C:/ClearlyHired:
    raise RuntimeError
```

Development startup log should print:

```text
Database URL: sqlite+aiosqlite:///C:/RealEstateMVP/realestate_mvp_v1.db
```

Test:

```powershell
Select-String -Path backend\app\core\config.py -Pattern "clearlyhired_v2"
```

Expected after transformation:

```text
No active default reference
```

It is acceptable to mention old DB only inside guard/error text.

---

## Page 08 - Product Domain Model Summary

Primary domain:

```text
Property Listing
Property Image
Property Inquiry
Property Audit Log
User
Email Log
Email Template
```

Listing states:

```text
draft
pending_review
approved
rejected
unpublished
archived
```

Public visible state:

```text
approved only
```

Owner visible states:

```text
own draft
own pending_review
own approved
own rejected
own unpublished
own archived
```

Admin visible states:

```text
all
```

Public contact:

```text
business/company phone only
```

Private owner fields:

```text
owner email
owner phone
owner_user_id
address_line if marked private
admin_note
audit logs
```

---

## Page 09 - Property Listing Table

Create `property_listings`.

Fields:

```text
id UUID primary key
owner_user_id UUID foreign key users.id
title string required
slug string unique required
description text required
listing_purpose string required
property_type string required
property_subtype string nullable
status string required default draft
price_amount integer nullable
price_label string nullable
price_visibility string required default show_price
currency string default BDT
price_period string nullable
division string nullable
district string nullable
city string required
area_name string required
address_line string nullable
display_address string required
map_lat decimal nullable
map_lng decimal nullable
bedrooms integer nullable
bathrooms integer nullable
balconies integer nullable
parking_spaces integer nullable
floor_number integer nullable
total_floors integer nullable
size_value decimal nullable
size_unit string nullable
land_size_value decimal nullable
land_size_unit string nullable
plot_type string nullable
facing string nullable
handover_status string nullable
handover_date date nullable
furnishing_status string nullable
amenities_json text nullable
nearby_places_json text nullable
owner_note text nullable
admin_note text nullable
featured boolean default false
approved_by_user_id UUID nullable
approved_at datetime nullable
published_at datetime nullable
rejected_at datetime nullable
unpublished_at datetime nullable
created_at datetime
updated_at datetime
```

Enums as strings for MVP speed.

Indexes:

```text
status
slug
city
area_name
listing_purpose
property_type
price_amount
bedrooms
bathrooms
size_value
created_at
featured
```

---

## Page 10 - Property Type And Purpose Values

Listing purpose:

```text
sale
rent
```

Property type:

```text
apartment
house
land
commercial
office
shop
warehouse
factory
other
```

Land plot type:

```text
residential
commercial
agricultural
industrial
mixed_use
other
```

Price visibility:

```text
show_price
call_for_price
```

Size unit:

```text
sqft
katha
decimal
bigha
acre
```

Furnishing status:

```text
unfurnished
semi_furnished
furnished
unknown
```

Handover status:

```text
ready
under_construction
upcoming
unknown
```

---

## Page 11 - Property Image Table

Create `property_images`.

Fields:

```text
id UUID primary key
listing_id UUID foreign key property_listings.id
storage_path string required
public_url string required
alt_text string nullable
sort_order integer default 0
is_cover boolean default false
uploaded_by_user_id UUID foreign key users.id
created_at datetime
```

Rules:

- Max 10 images per listing.
- Max 5MB per image.
- Allowed extensions: jpg, jpeg, png, webp.
- Cover image required for approval unless admin override is explicitly coded.
- Public can see images only for approved listings.
- Owner can see own images for all own listing states.
- Admin can see all images.

Storage:

```text
userdata/property-images/{listing_id}/{image_id}.{ext}
```

Never store property images under `nextjs-frontend/src`.

---

## Page 12 - Property Inquiry Table

Create `property_inquiries`.

Fields:

```text
id UUID primary key
listing_id UUID foreign key property_listings.id
name string required
phone string required
email string nullable
message text nullable
preferred_contact_method string default phone
source_page string nullable
ip_hash string nullable
user_agent string nullable
status string default new
assigned_admin_user_id UUID nullable
created_at datetime
updated_at datetime
```

Status values:

```text
new
contacted
closed
spam
```

Rules:

- Inquiry is allowed only for approved public listing.
- Inquiry should trigger internal admin email.
- Optional visitor confirmation email if visitor provides email.
- Listing owner does not receive inquiry directly in MVP.
- Public inquiry response should not reveal admin email.

---

## Page 13 - Property Audit Log Table

Create `property_audit_logs`.

Fields:

```text
id UUID primary key
listing_id UUID foreign key property_listings.id
actor_user_id UUID nullable
action string required
from_status string nullable
to_status string nullable
note text nullable
metadata_json text nullable
created_at datetime
```

Actions:

```text
created
updated
submitted
approved
rejected
unpublished
archived
image_added
image_removed
admin_edited
```

Visibility:

- Admin sees all.
- Owner sees simplified timeline only.
- Public sees none.

Audit log is important because approval workflow needs accountability.

---

## Page 14 - Backend File Additions

Add files:

```text
backend/app/models/property_listing.py
backend/app/models/property_image.py
backend/app/models/property_inquiry.py
backend/app/models/property_audit_log.py
backend/app/schemas/property_schema.py
backend/app/routes/properties.py
backend/app/routes/admin_properties.py
backend/app/services/property_image_service.py
backend/app/services/property_notification_service.py
backend/scripts/init_realestate_db.py
backend/scripts/seed_realestate_demo.py
```

Update:

```text
backend/app/models/__init__.py
backend/app/main.py
backend/app/core/config.py
backend/app/services/email_service.py
backend/app/routes/admin.py only if email hub route remains there
```

Do not edit original project. These are edits in `C:\RealEstateMVP` only.

---

## Page 15 - Public Property API

Add router prefix:

```text
/properties
```

Endpoints:

```text
GET /properties
GET /properties/{slug}
POST /properties/{listing_id}/inquiries
```

`GET /properties` query params:

```text
keyword
listing_purpose
property_type
division
district
city
area_name
min_price
max_price
bedrooms
bathrooms
min_size
max_size
size_unit
land_size_min
land_size_max
land_size_unit
price_visibility
sort
page
page_size
```

Rules:

- Always filter `status == approved`.
- Default sort: newest.
- Default page size: 12.
- Max page size: 50.
- Public response must use public schema only.
- Public schema must never include owner phone/email/admin note.

---

## Page 16 - Owner Property API

Use same `/properties` router with authenticated `/me` endpoints.

Endpoints:

```text
GET /properties/me
POST /properties
GET /properties/me/{listing_id}
PUT /properties/me/{listing_id}
POST /properties/me/{listing_id}/submit
POST /properties/me/{listing_id}/images
DELETE /properties/me/{listing_id}/images/{image_id}
DELETE /properties/me/{listing_id}
```

Rules:

- Owner must be authenticated.
- Owner can only access own listings.
- Owner cannot approve.
- Owner cannot edit another user's listing.
- Editing approved listing returns it to `pending_review` unless admin is editing.
- Delete should archive if listing was approved before.
- Draft can be hard deleted if no public history exists.

Submit validation:

- Title exists.
- Description exists.
- Purpose/type exists.
- City/area/display address exists.
- Price amount exists unless call-for-price.
- Image exists for MVP approval readiness.

---

## Page 17 - Admin Property API

Add router prefix:

```text
/admin/properties
```

Endpoints:

```text
GET /admin/properties
GET /admin/properties/stats
GET /admin/properties/{listing_id}
PATCH /admin/properties/{listing_id}
POST /admin/properties/{listing_id}/approve
POST /admin/properties/{listing_id}/reject
POST /admin/properties/{listing_id}/unpublish
POST /admin/properties/{listing_id}/archive
```

Admin filters:

```text
status
property_type
listing_purpose
city
area_name
owner_email
keyword
created_from
created_to
sort
page
page_size
```

Rules:

- Admin-only.
- Manager role support optional; MVP should use admin only unless existing shell requires manager.
- Approval sends owner email.
- Rejection requires note and sends owner email.
- Unpublish sends owner email if configured.
- Admin edit creates audit log.

---

## Page 18 - Admin Inquiry API

Endpoints:

```text
GET /admin/inquiries
GET /admin/inquiries/{inquiry_id}
PATCH /admin/inquiries/{inquiry_id}
POST /admin/inquiries/{inquiry_id}/mark-contacted
POST /admin/inquiries/{inquiry_id}/mark-closed
POST /admin/inquiries/{inquiry_id}/mark-spam
```

Filters:

```text
status
listing_id
phone
email
keyword
created_from
created_to
page
page_size
```

Rules:

- Admin-only.
- Inquiry table should include listing title and slug.
- Admin can see visitor phone/email.
- Client owner should not see visitor data unless later approved by business.

---

## Page 19 - Email System Transformation

Reuse email system mechanics:

- `EMAIL_PROVIDER=console|smtp`
- DB email logs.
- Email templates.
- Admin email composer.
- Admin template editor.
- Attachments if already supported.
- Cache invalidation.

Replace sender identities:

```text
support: support@placeholder-domain
security: security@placeholder-domain
listings: listings@placeholder-domain
inquiries: inquiries@placeholder-domain
admin: admin@placeholder-domain
```

Until domain is chosen:

```text
EMAIL_PROVIDER=console
```

Required functions:

```text
send_welcome_email
send_password_reset_email
send_listing_submitted_owner
send_listing_submitted_admin
send_listing_approved_owner
send_listing_rejected_owner
send_listing_unpublished_owner
send_inquiry_received_admin
send_inquiry_confirmation_visitor
send_html_email_with_attachments
```

Remove or leave unused:

```text
weekly job report emails
billing trial emails
job proof sales call emails
```

---

## Page 20 - Email Template Keys

Seed templates:

```text
welcome_email
password_reset
listing_submitted_owner
listing_submitted_admin
listing_approved_owner
listing_rejected_owner
listing_unpublished_owner
inquiry_received_admin
inquiry_confirmation_visitor
admin_custom_email
```

Template variables:

`welcome_email`:

```text
first_name
dashboard_url
```

`listing_submitted_owner`:

```text
first_name
listing_title
dashboard_listing_url
```

`listing_submitted_admin`:

```text
listing_title
owner_name
owner_email
admin_review_url
```

`listing_approved_owner`:

```text
first_name
listing_title
public_listing_url
```

`listing_rejected_owner`:

```text
first_name
listing_title
admin_note
edit_listing_url
```

`inquiry_received_admin`:

```text
listing_title
visitor_name
visitor_phone
visitor_email
visitor_message
admin_inquiry_url
```

---

## Page 21 - Frontend Route Map

Public:

```text
/
/properties
/properties/[slug]
/post-property
/property-requirements
/about
/contact
/privacy
/terms
/auth/login
/auth/register
/reset
```

Client:

```text
/dashboard
/dashboard/listings
/dashboard/listings/new
/dashboard/listings/[id]/edit
/dashboard/inquiries
/dashboard/profile
/dashboard/settings
```

Admin:

```text
/admin
/admin/properties
/admin/properties/[id]
/admin/inquiries
/admin/users
/admin/email-hub
/admin/email-hub/compose
/admin/email-hub/templates
/admin/settings
```

Hide or remove:

```text
/resume-parser
/dashboard/documents
/dashboard/applications
/dashboard/billing
/team
/pricing if billing disabled
```

---

## Page 22 - Frontend Library Files

Add:

```text
nextjs-frontend/src/lib/property-api.ts
nextjs-frontend/src/lib/admin-property-api.ts
nextjs-frontend/src/lib/inquiry-api.ts
```

`property-api.ts`:

```text
searchProperties
getPublicProperty
getMyListings
getMyListing
createListing
updateListing
submitListing
deleteListing
uploadListingImage
deleteListingImage
```

`admin-property-api.ts`:

```text
getAdminPropertyStats
getAdminProperties
getAdminProperty
approveProperty
rejectProperty
unpublishProperty
archiveProperty
updateAdminProperty
```

`inquiry-api.ts`:

```text
createInquiry
getAdminInquiries
getAdminInquiry
updateInquiry
markInquiryContacted
markInquiryClosed
markInquirySpam
```

Use existing `apiFetch` and auth header pattern.

---

## Page 23 - Public Components

Create:

```text
PropertyCard
PropertyGrid
PropertySearchBar
PropertyFilterPanel
PropertySortSelect
PropertyImageGallery
PropertyFacts
InquiryForm
FeaturedListings
PopularAreas
PostPropertyCTA
```

`PropertyCard` must show:

```text
cover image
purpose badge
type
title
area/city
price or call for price
beds/baths/size where relevant
view details link
company phone CTA optional
```

Do not show:

```text
owner phone
owner email
admin note
owner user id
```

Mobile:

- Cards stack.
- Filter drawer.
- Sticky call button on detail page.

---

## Page 24 - Dashboard Components

Create:

```text
ListingStatusBadge
ListingTable
ListingDashboardSummary
ListingForm
ListingImageUploader
ListingSubmitPanel
RejectedListingNotice
```

Dashboard home:

```text
Total listings
Draft
Pending review
Published
Rejected
New listing CTA
Recent listings
```

Client listing actions:

```text
draft: edit, submit, delete
pending_review: view
approved: view public, edit/resubmit, archive
rejected: view note, edit, resubmit
unpublished: view, resubmit if allowed
archived: view only
```

UX rule:

- Client should always know the next action.
- Rejection reason should be visible but admin-only notes should stay private.

---

## Page 25 - Admin Components

Create or adapt:

```text
AdminStatsCards
PendingListingsQueue
AdminPropertyTable
AdminPropertyReview
AdminApprovalPanel
AdminInquiryTable
AdminUserListingsPanel
AdminEmailHealthCard
```

Admin dashboard widgets:

```text
Pending listings
Approved listings
Rejected listings
New inquiries
Total users
Emails sent today
```

Admin review page:

```text
Owner info
Listing data
Images
Public preview
Validation checklist
Audit timeline
Approve/reject/unpublish controls
```

Rejection form:

```text
admin_note required
```

Approval must be blocked if public phone env missing.

---

## Page 26 - Public Homepage Specification

Hero:

```text
Find reviewed apartments, land, and commercial spaces.
```

Search controls:

```text
Buy/Rent toggle
Location input
Property type
Min price
Max price
Search button
```

Sections:

```text
Featured listings
Latest apartments
Latest land/plots
Commercial spaces
Popular areas
How listing approval works
Post your property CTA
Requirement request CTA
Company phone/contact
```

Data:

- Use approved listings only.
- Featured can mean `featured=true`, fallback latest approved.

Homepage should not depend on login.

---

## Page 27 - Public Search Page Specification

Route:

```text
/properties
```

Query examples:

```text
/properties?listing_purpose=sale&property_type=land&city=Dhaka
/properties?listing_purpose=rent&property_type=apartment&bedrooms=3
```

UI:

```text
Filter sidebar desktop
Filter drawer mobile
Result count
Sort
Cards
Pagination
Empty state
```

Required filters:

```text
keyword
purpose
property type
division
district
city
area
min price
max price
bedrooms
bathrooms
min size
max size
land size
price visibility
```

Sort:

```text
newest
price low to high
price high to low
size large to small
featured first
```

---

## Page 28 - Public Detail Page Specification

Route:

```text
/properties/[slug]
```

Sections:

```text
Image gallery
Title
Price
Location
Facts
Description
Amenities
Company phone CTA
Inquiry form
Similar listings
```

Phone display:

```text
Call {REAL_ESTATE_PUBLIC_PHONE}
```

Inquiry success:

```text
Thanks. Our team received your request and will contact you soon.
```

404:

- If listing not approved, public route returns 404.
- Do not reveal pending/rejected listing exists.

---

## Page 29 - Post Property Page

Route:

```text
/post-property
```

If unauthenticated:

- Explain process.
- CTA login/signup.
- Store redirect target.

If authenticated:

- Redirect to `/dashboard/listings/new`.

Copy:

```text
Post your property for review. Your phone number will not be shown publicly. Buyers will contact our team first.
```

Steps shown:

```text
1. Create account
2. Add property details
3. Upload photos
4. Submit for review
5. Admin approves and publishes
```

---

## Page 30 - Listing Form UX

Form sections:

```text
Basic info
Location
Price
Property details
Land details
Amenities
Images
Review and submit
```

Save behavior:

- Save draft button.
- Submit for review button.
- Autosave optional, not MVP required.

Validation:

- Title 10-120 chars.
- Description 50-5000 chars.
- City and area required.
- Purpose/type required.
- Price required unless call-for-price.
- For apartment/house: bedrooms/bathrooms recommended.
- For land: land size required.
- At least one image required before submit.

On approved listing edit:

- Editing should set status back to `pending_review`.
- Public listing should either disappear until reapproved or show last approved version.
- MVP default: disappear until reapproved.

---

## Page 31 - Client Dashboard Page

Route:

```text
/dashboard
```

Widgets:

```text
Total listings
Pending review
Published
Rejected
Inquiries
```

Primary CTA:

```text
Post a Property
```

Secondary CTAs:

```text
View listings
Edit profile
Contact support
```

Recent listing card:

```text
Title
Status
Updated date
Next action
```

Client dashboard should not show resume/job/billing cards.

---

## Page 32 - Client Listing Table

Route:

```text
/dashboard/listings
```

Columns:

```text
Image
Title
Type
Purpose
Location
Price
Status
Updated
Actions
```

Filters:

```text
status
type
purpose
keyword
```

Empty state:

```text
No listings yet. Post your first property.
```

Actions:

```text
Edit
Submit
View public
Archive
Delete draft
```

Public link shown only if status `approved`.

---

## Page 33 - Admin Dashboard Page

Route:

```text
/admin
```

Top priority:

- Pending listings queue must be above all other metrics.

Cards:

```text
Pending listings
Published listings
Rejected listings
New inquiries
Users
Email sends
```

Tables:

```text
Latest pending listings
Latest inquiries
Recently approved listings
```

Admin action speed:

- From dashboard, admin can open review page in one click.
- From review page, approve/reject in one action.

---

## Page 34 - Admin Listing Queue

Route:

```text
/admin/properties
```

Filters:

```text
status
type
purpose
city
area
owner email
date range
```

Default filter:

```text
status=pending_review
```

Table columns:

```text
Cover
Title
Owner
Location
Type
Purpose
Price
Status
Submitted
Actions
```

Bulk actions:

- Not MVP.

Admin should review one listing at a time.

---

## Page 35 - Admin Listing Review Page

Route:

```text
/admin/properties/[id]
```

Sections:

```text
Approval controls
Public preview
Owner info
Listing facts
Images
Description
Location
Validation checklist
Audit log
```

Approval checklist:

```text
Has clear title
Has useful description
Has valid location
Has price or call-for-price
Has company phone configured
Has at least one image
No owner phone exposed publicly
No spam or prohibited content
```

Buttons:

```text
Approve
Reject
Unpublish
Save admin edits
```

Reject modal:

```text
Reason required
Send email checkbox default true
```

---

## Page 36 - Admin Inquiry Page

Route:

```text
/admin/inquiries
```

Columns:

```text
Date
Listing
Visitor name
Phone
Email
Message
Status
Actions
```

Actions:

```text
Mark contacted
Mark closed
Mark spam
Open listing
Open owner
```

Default sort:

```text
newest first
```

Default filter:

```text
status=new
```

Email:

- New inquiry triggers internal alert.
- Inquiry confirmation goes to visitor only if email present.

---

## Page 37 - Admin Email Hub

Keep existing admin email hub mechanics.

Routes:

```text
/admin/email-hub
/admin/email-hub/compose
/admin/email-hub/templates
```

Update labels:

```text
ClearlyHired -> product placeholder
Reports -> Listings/Inquiries
Clients -> Users/Owners
```

Email logs should show:

```text
welcome
password_reset
listing_submitted_owner
listing_submitted_admin
listing_approved_owner
listing_rejected_owner
inquiry_received_admin
inquiry_confirmation_visitor
composer
```

Server stats:

- Keep if useful.
- If it references old mail domain, rebrand.

---

## Page 38 - Rebranding Checklist

Search and replace carefully:

```text
ClearlyHired
HireMeAI
hiremeai
hireme
Simplify
resume
job application
applications
client where it means job-search client
team member
weekly report
billing trial
```

Not all terms should be blindly replaced. Use meaning:

- `client` internal role can remain for speed.
- Public UI should say owner, user, property lister, account.
- `applications` in job context should be removed.
- `documents` route should be hidden unless property document upload exists.

Critical keys:

```text
hiremeai_auth_user -> realestate_auth_user
hireme_auth -> realestate_auth
PROJECT_NAME -> RealEstateMVP API
```

---

## Page 39 - Navigation Changes

Public nav:

```text
Home
Properties
Post Property
About
Contact
Login
```

Logged-in user nav:

```text
Dashboard
My Listings
Post Property
Settings
Logout
```

Admin nav:

```text
Dashboard
Listings
Inquiries
Users
Email Hub
Settings
Logout
```

Remove/hide:

```text
Resume Parser
Documents
Applications
Billing
Team
Reports
Pricing if payment disabled
```

---

## Page 40 - Public Contact Number Rule

This is a hard product requirement.

Implementation:

- Backend config has `REAL_ESTATE_PUBLIC_PHONE`.
- Public listing response includes `public_contact_phone`.
- Frontend detail page renders public phone from response/env.
- Owner phone is never included in public response.

Test:

```text
Create owner with phone 01711111111
Set company phone 01822222222
Approve listing
Fetch public listing JSON
Assert 01711111111 absent
Assert 01822222222 present
```

Launch blocker:

- If owner phone appears in page HTML or public JSON, do not launch.

---

## Page 41 - Backend Test Plan

Required tests:

```text
test_auth_register_login
test_create_listing_draft
test_owner_gets_own_listing
test_other_user_cannot_get_listing
test_submit_listing
test_pending_listing_not_public
test_admin_gets_pending_listing
test_admin_approves_listing
test_approved_listing_public
test_admin_rejects_listing_with_note
test_rejection_note_visible_to_owner
test_rejection_note_not_public
test_owner_phone_not_public
test_company_phone_public
test_public_search_filters_status_approved_only
test_inquiry_requires_approved_listing
test_inquiry_creates_record
test_inquiry_triggers_admin_email_log
test_image_upload_validation
test_non_admin_cannot_approve
```

Run:

```powershell
cd C:\RealEstateMVP\backend
python -m pytest
```

If no pytest suite exists, create targeted tests for new routes.

---

## Page 42 - Frontend Test Plan

Required user flows:

```text
visitor_open_homepage
visitor_search_properties
visitor_open_property_detail
visitor_sees_company_phone
visitor_submit_inquiry
user_signup
user_login
user_create_listing_draft
user_upload_image
user_submit_listing
admin_login
admin_open_pending_queue
admin_approve_listing
approved_listing_appears_publicly
admin_reject_listing
owner_sees_rejection_reason
```

Run:

```powershell
cd C:\RealEstateMVP\nextjs-frontend
npm run lint
npm run build
npm run test:e2e
```

If Playwright not stable, run manual browser smoke and document exact results.

---

## Page 43 - Manual Smoke Test Script

Manual smoke:

1. Start backend on 8090.
2. Start frontend on 3010.
3. Open homepage.
4. Confirm no ClearlyHired branding.
5. Register new user.
6. Login.
7. Open dashboard.
8. Create apartment listing.
9. Upload image.
10. Submit for review.
11. Logout.
12. Confirm listing not visible publicly.
13. Login admin.
14. Open admin listings.
15. Approve listing.
16. Logout.
17. Search public properties.
18. Open listing detail.
19. Confirm company phone visible.
20. Confirm owner phone absent.
21. Submit inquiry.
22. Login admin.
23. Confirm inquiry visible.
24. Confirm email logs show events.

Pass criteria:

- No critical error.
- No private data leak.
- Approval workflow works.

---

## Page 44 - Seed Data Plan

Seed users:

```text
admin@realestate.local / Admin123!
owner@realestate.local / Owner123!
buyer@realestate.local / Buyer123!
```

Seed listings:

```text
Approved apartment in Gulshan
Approved land in Purbachal
Approved commercial space in Motijheel
Pending apartment in Uttara
Rejected land listing with note
Draft house listing
```

Seed images:

- Use placeholder local images or simple static placeholder.
- Do not depend on external image URLs for tests.

Seed email templates:

- All MVP template keys.

Seed command:

```powershell
python backend\scripts\seed_realestate_demo.py
```

---

## Page 45 - SEO And Indexing

Index:

```text
/
/properties
/properties/[approved-slug]
/about
/contact
```

Noindex:

```text
/dashboard/*
/admin/*
/auth/*
/reset
/properties pending/rejected are not reachable
```

Listing metadata:

```text
title: {title} | {brand}
description: {property_type} for {sale/rent} in {area_name}, {city}
og:image: cover image
canonical: /properties/{slug}
```

Sitemap:

- Include approved listing URLs.
- Exclude draft/pending/rejected/unpublished.

Robots:

- Disallow `/admin`.
- Disallow `/dashboard`.

---

## Page 46 - Build Order For Fast MVP

Day 1:

- Clone.
- Isolate env/db/ports.
- Verify backend/frontend.
- Rebrand minimum shell.
- Confirm email console logs.

Day 2:

- Add property models/schemas.
- Add DB init/seed.
- Add public/owner/admin APIs.
- Add backend tests.

Day 3:

- Add public search/detail UI.
- Add inquiry form.
- Add company phone rule.

Day 4:

- Add dashboard listing CRUD.
- Add image upload.
- Add submit flow.

Day 5:

- Add admin listing queue/review.
- Add approve/reject/unpublish.
- Add notification emails.

Day 6:

- Rebrand email hub.
- Hide old routes.
- Add SEO/sitemap.
- Run full build.

Day 7:

- E2E smoke.
- Mobile pass.
- Fix blockers.
- Handoff.

---

## Page 47 - Common Failure Modes And Fixes

Failure: backend uses old DB.

Fix:

- Stop server.
- Check `DATABASE_URL`.
- Delete wrong generated DB in clone only if safe.
- Add startup guard.

Failure: frontend calls old backend.

Fix:

- Check `NEXT_PUBLIC_API_URL`.
- Restart Next.js dev server.
- Clear browser cache/localStorage.

Failure: auth user stuck from old app.

Fix:

- Rename storage key.
- Clear localStorage.
- Rename cookie.

Failure: public listing shows owner phone.

Fix:

- Separate public/admin schemas.
- Never serialize ORM user relation into public response.
- Add test.

Failure: email sends with old brand.

Fix:

- Update sender map.
- Update template seed.
- Search old brand strings.
- Use console provider until domain ready.

Failure: template import breaks build.

Fix:

- Revert only template import in clone.
- Build native components gradually.

---

## Page 48 - Acceptance Checklist

MVP cannot be accepted until all are true:

- New app runs from `C:\RealEstateMVP`.
- Original `C:\ClearlyHired` untouched.
- Backend DB is `realestate_mvp_v1.db`.
- Frontend calls backend `8090`.
- User signup works.
- User login works.
- Client dashboard works.
- Client creates listing.
- Client uploads image.
- Client submits listing.
- Pending listing not public.
- Admin sees pending listing.
- Admin approves listing.
- Approved listing public.
- Admin rejects listing with note.
- Owner sees rejection note.
- Public does not see rejection note.
- Public phone is company phone.
- Owner phone not public.
- Inquiry submit works.
- Admin sees inquiry.
- Email logs contain required events.
- Email hub loads.
- Old job/resume navigation hidden.
- Build passes.
- Critical smoke passes.

---

## Page 49 - Deployment Preparation

Before staging:

```text
Choose staging domain/subdomain
Set FRONTEND_URL
Set ALLOWED_ORIGINS
Set SECRET_KEY
Set DB path
Set public phone
Set public email
Set EMAIL_PROVIDER=console or smtp test
Create admin user
Seed initial categories
Run smoke tests
```

Before production:

```text
Choose final brand
Choose final domain
Set SMTP
Configure SPF
Configure DKIM
Configure DMARC
Confirm backup process
Confirm image storage backup
Confirm privacy/terms
Confirm admin phone
Run public data leak test
Run mobile test
Run build
```

Do not enable production SMTP until sender domain is verified.

---

## Page 50 - Final Implementation Command Sequence

High-level sequence:

```text
1. Clone to C:\RealEstateMVP
2. Rename remote
3. Create branch
4. Configure new env/db/ports
5. Verify baseline auth/admin/email
6. Add property models
7. Add property schemas
8. Add DB init and seed
9. Add public property API
10. Add owner property API
11. Add admin property API
12. Add inquiry API
13. Add email notifications
14. Add public frontend pages
15. Add client dashboard pages
16. Add admin dashboard pages
17. Rebrand email hub
18. Hide old product routes
19. Add tests
20. Run backend tests
21. Run frontend lint/build
22. Run E2E smoke
23. Fix blockers
24. Document final state
```

Implementation must not start from visual template. Backend contract and data privacy must come first.

---

## Page 51 - Exact Backend Implementation Checklist

Backend engineer/agent checklist:

- Update `backend/app/core/config.py` in clone.
- Add DB guard.
- Add public phone/email settings.
- Add property models.
- Import models in `backend/app/models/__init__.py`.
- Add property schemas.
- Add `properties.py`.
- Add `admin_properties.py`.
- Include routers in `backend/app/main.py`.
- Add image service.
- Add notification service.
- Rebrand email sender map.
- Add new template builders.
- Keep password reset.
- Keep admin email hub.
- Add seed script.
- Add tests.
- Run health.
- Run auth smoke.
- Run property smoke.

Done means:

- APIs return expected JSON.
- Public API hides owner private fields.
- Email logs created.

---

## Page 52 - Exact Frontend Implementation Checklist

Frontend engineer/agent checklist:

- Update app metadata.
- Rename auth storage key/cookie.
- Update public nav.
- Add property API helpers.
- Add public homepage real estate sections.
- Add `/properties`.
- Add `/properties/[slug]`.
- Add `/post-property`.
- Add dashboard listing routes.
- Add listing form.
- Add image upload.
- Add admin property routes.
- Add admin inquiry routes.
- Update admin nav.
- Rebrand email hub text.
- Hide old routes from nav.
- Update SEO metadata.
- Run lint/build.
- Run browser smoke.

Done means:

- User can complete listing lifecycle.
- Admin can approve.
- Public can search.
- Mobile works.

---

## Page 53 - Critical Code Review Checklist

Before merge:

- Are all changes inside clone, not original repo?
- Is DB path safe?
- Are public schemas separate from admin schemas?
- Does public listing response exclude owner phone/email?
- Does listing approval require admin?
- Does rejection require note?
- Are email templates rebranded?
- Are old SMTP secrets absent?
- Are old Stripe keys absent?
- Are old job/resume nav links hidden?
- Does `npm run build` pass?
- Do backend tests pass?
- Does manual smoke pass?

Block merge if any answer fails.

---

## Page 54 - Handoff Notes Template

After implementation, create:

```text
docs/02-context/REAL_ESTATE_MVP_HANDOFF.md
```

Include:

```text
What was built
How to start backend
How to start frontend
Seed users
Env vars required
Routes implemented
Tests run
Known gaps
Launch blockers
Next recommended work
```

Do not include secrets.

---

## Page 55 - Final Principle

The MVP succeeds if it does a small number of things reliably:

- People can submit real estate listings.
- Admins can review and approve them.
- Approved listings are publicly searchable.
- Buyers contact the business, not the property owner directly.
- Email notifications and logs work.
- The original ClearlyHired system remains untouched.

Everything else is secondary.

