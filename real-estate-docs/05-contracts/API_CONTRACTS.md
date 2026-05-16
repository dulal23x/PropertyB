# API_CONTRACTS

## System
- Backend port: `8090`.
- Frontend port: `3010`.
- Standard rate limit response: `429` with structured detail and `Retry-After`.
- Correlation header: `X-Request-ID`.

## Health
- `GET /health`
- `GET /health/email`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/password-reset/request`
- `GET /auth/password-reset/validate`
- `POST /auth/password-reset/confirm`

## Public Properties
- `GET /properties`: approved listing search.
- `GET /properties/{slug}`: approved listing detail.
- `POST /properties/{listing_id}/inquiries`: create inquiry for approved listing.
- `GET /properties` supports filters for keyword, `listing_purpose` or `purpose`, `property_type` or `type`, location, price ranges, beds/baths, size/land-size, price visibility, sort, page, page_size.
- Public property responses include business contact fields and `currency`, and must continue to exclude owner private fields.

## Owner Properties
- `GET /properties/me`
- `POST /properties`
- `GET /properties/me/{listing_id}`
- `PUT /properties/me/{listing_id}`
- `POST /properties/me/{listing_id}/submit`
- `POST /properties/me/{listing_id}/images`
- `DELETE /properties/me/{listing_id}/images/{image_id}`
- `DELETE /properties/me/{listing_id}`

## Admin Properties
- `GET /admin/properties`
- `GET /admin/properties/stats`
- `GET /admin/properties/{listing_id}`
- `PATCH /admin/properties/{listing_id}`
- `POST /admin/properties/{listing_id}/approve`
- `POST /admin/properties/{listing_id}/reject`
- `POST /admin/properties/{listing_id}/unpublish`
- `POST /admin/properties/{listing_id}/archive`
- `GET /admin/properties` supports filters for status/type/purpose/city/area/owner_email/keyword and pagination.

## Admin Inquiries
- `GET /admin/inquiries`
- `GET /admin/inquiries/{inquiry_id}`
- `PATCH /admin/inquiries/{inquiry_id}`
- `POST /admin/inquiries/{inquiry_id}/mark-contacted`
- `POST /admin/inquiries/{inquiry_id}/mark-closed`
- `POST /admin/inquiries/{inquiry_id}/mark-spam`
- `GET /admin/inquiries` supports filters for status/listing/phone/email/keyword and pagination.

## Admin Email Hub
- `GET /admin/email/logs`
- `GET /admin/email/logs/{log_id}/content`
- `GET /admin/email/user/{email}/history`
- `POST /admin/email/send`
- `GET /admin/email/server-stats`
- `GET /admin/email/templates`
- `PUT /admin/email/templates/{template_id}`

## Admin Users
- `GET /admin/users`
- `PATCH /admin/users/{user_id}`

## Access Control
- Public: health, auth login/register/reset request, public property search/detail, inquiry create.
- Authenticated owner: `/properties/me*`.
- Admin-only: `/admin/*`.
- Public property APIs must return `approved` listings only and must never expose owner private fields.

## Contract Rule
Any endpoint, payload, auth rule, or response shape change requires updating this file.
