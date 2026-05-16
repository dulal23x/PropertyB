# DATA_FLOW

## Listing Submission Flow
1. User signs up or logs in.
2. User creates listing draft.
3. Backend stores listing as `draft`.
4. User uploads images.
5. User submits listing.
6. Backend validates required fields and image presence.
7. Backend sets status `pending_review`.
8. Email service logs/sends owner confirmation and admin alert.

## Admin Approval Flow
1. Admin opens pending queue.
2. Admin reviews listing, owner info, images, validation checklist.
3. Admin approves or rejects.
4. Approve sets `approved`, `approved_at`, `published_at`, and `approved_by_user_id`.
5. Reject sets `rejected`, `rejected_at`, and `admin_note`.
6. Audit log is written.
7. Email notification is logged/sent to owner.

## Public Search Flow
1. Visitor searches `/properties`.
2. Backend applies filters and `status=approved`.
3. Backend returns public schema only.
4. Frontend renders cards and business phone CTA.

## Inquiry Flow
1. Visitor submits inquiry on approved listing detail page.
2. Backend validates phone/name and rate limits.
3. Inquiry row is stored.
4. Internal admin email alert is logged/sent.
5. Optional visitor confirmation email is logged/sent if email exists.
6. Admin handles inquiry in `/admin/inquiries`.

