# FEATURE_EMAIL_SYSTEM

## Purpose
Reuse the provider-based email system for transactional listing and inquiry notifications.

## Provider Modes
- `console`: development and safe local testing.
- `smtp`: production after sender domain is verified.

## Required Senders
- `support`
- `security`
- `listings`
- `inquiries`
- `admin`

## Required Template Keys
- `welcome_email`
- `password_reset`
- `listing_submitted_owner`
- `listing_submitted_admin`
- `listing_approved_owner`
- `listing_rejected_owner`
- `listing_unpublished_owner`
- `inquiry_received_admin`
- `inquiry_confirmation_visitor`
- `admin_custom_email`

## Admin Email Hub
Admin can view logs, inspect content, send custom email, and edit templates.

## Safety Rules
- No old sender domains in production.
- No SMTP secrets in docs/frontend/commits.
- Composer is admin-only and rate-limited.
- Every send attempt is logged.

