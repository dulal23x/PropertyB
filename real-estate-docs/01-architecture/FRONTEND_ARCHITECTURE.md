# FRONTEND_ARCHITECTURE

## Purpose
Define frontend architecture for the real estate MVP.

## Framework
- Next.js App Router.
- React.
- TypeScript.
- Existing dashboard/admin shell patterns from the cloned source.

## Route Groups
Public:

- `/`
- `/properties`
- `/properties/[slug]`
- `/post-property`
- `/property-requirements`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/auth/login`
- `/auth/register`
- `/reset`

Client:

- `/dashboard`
- `/dashboard/listings`
- `/dashboard/listings/new`
- `/dashboard/listings/[id]/edit`
- `/dashboard/inquiries`
- `/dashboard/profile`
- `/dashboard/settings`

Admin:

- `/admin`
- `/admin/properties`
- `/admin/properties/[id]`
- `/admin/inquiries`
- `/admin/users`
- `/admin/email-hub`
- `/admin/email-hub/compose`
- `/admin/email-hub/templates`
- `/admin/settings`

## Required API Libraries
- `src/lib/property-api.ts`
- `src/lib/admin-property-api.ts`
- `src/lib/inquiry-api.ts`
- existing auth/api-client helpers adapted to real estate storage keys.

## UI Priority
Build backend-connected property flows before visual polish. Template UI can be used as inspiration only after the API contract is stable.

