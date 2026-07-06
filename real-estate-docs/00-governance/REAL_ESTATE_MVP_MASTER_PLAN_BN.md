# Real Estate MVP Master Plan

## Build Strategy
1. Clone/reference ClearlyHired architecture without modifying the reference repo.
2. Isolate DB, ports, env, storage keys, and branding.
3. Keep auth, admin shell, email hub, and API client patterns.
4. Replace job/resume domain with property listing domain.
5. Implement backend contracts before UI.
6. Verify public/private data separation before launch.

## MVP Flow
Visitor searches approved listings, opens a listing, sees business phone, and can send inquiry. User signs up, creates a draft listing, uploads images, submits for review, and tracks status. Admin reviews pending listings, approves/rejects/unpublishes, manages inquiries, users, and emails.

## Primary Tables
- `users`
- `property_listings`
- `property_images`
- `property_inquiries`
- `property_audit_logs`
- `email_logs`
- `email_templates`
- `password_reset_tokens`

## Critical Milestones
- Environment isolated
- Auth baseline works
- Property API works
- Approval workflow works
- Public search works
- Dashboard works
- Email logs work
- Browser smoke passes

## Launch Blockers
- Old DB reference
- Owner phone leak
- Pending listing public leak
- Admin approval not protected
- Email sender not configured safely
- No backup plan
