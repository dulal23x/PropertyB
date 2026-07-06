# SYSTEM_OVERVIEW

## Purpose
Describe how the real estate MVP works end to end.

## System Shape
The app is a two-part web product:

- FastAPI backend on port `8090`.
- Next.js frontend on port `3010`.
- SQLite MVP database `realestate_mvp_v1.db`.
- Local property image storage under `userdata/property-images`.
- Email provider in `console` mode for development, `smtp` for production after domain verification.

## Core User Journeys
Visitor searches approved properties, views a listing, sees the business phone, and submits an inquiry.

Client signs up, creates a listing draft, uploads images, submits for admin review, and tracks listing status in dashboard.

Admin reviews pending listings, approves/rejects/unpublishes, manages inquiries, users, and email templates/logs.

## Data Privacy Boundary
Public listing APIs must never expose:

- owner email
- owner phone
- owner user id
- admin notes
- private address fields
- audit logs

Public listing APIs may expose:

- listing facts
- display address
- public images
- business phone/email
- approved listing metadata

## Approval Boundary
Only `approved` listings are public. `draft`, `pending_review`, `rejected`, `unpublished`, and `archived` listings are private to owner/admin routes.

## Reused Foundation
The project reuses the cloned backend/frontend architecture, JWT auth, admin shell, email logs/templates/composer, API client, and dashboard layout patterns from the reference system.

