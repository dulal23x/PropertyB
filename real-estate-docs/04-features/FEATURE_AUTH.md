# FEATURE_AUTH

## Purpose
Provide account creation, login, current user lookup, and password reset for listing owners and admins.

## Reused Behavior
- Email/password registration.
- JWT login.
- `/auth/me` current user.
- Password reset request/validate/confirm.
- Admin-created users.

## Roles
- `client`: default public signup role; UI label can be Property Owner or Account.
- `admin`: can approve listings, manage inquiries, users, and email.

## Storage
- localStorage key: `realestate_auth_user`.
- cookie key: `realestate_auth`.

## Redirects
- New user goes to `/dashboard`.
- Unauthenticated `/dashboard/*` and `/admin/*` routes redirect to `/auth/login`.
- Non-admin users cannot access `/admin/*`.

## Out Of Scope
- OAuth.
- Social login.
- Multi-tenant agencies.

