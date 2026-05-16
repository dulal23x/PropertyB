# UI_ROUTE_MAP

## Public Routes
- `/`: homepage.
- `/properties`: public approved listing search.
- `/properties/[slug]`: public approved listing detail.
- `/post-property`: CTA and auth gate to create listing.
- `/property-requirements`: visitor requirement capture, optional MVP.
- `/about`: company info.
- `/contact`: business contact.
- `/privacy`: privacy policy.
- `/terms`: terms.
- `/auth/login`: login.
- `/auth/register`: registration.
- `/reset`: password reset.

## Client Routes
- `/dashboard`: owner dashboard.
- `/dashboard/listings`: own listing management.
- `/dashboard/listings/new`: create listing.
- `/dashboard/listings/[id]/edit`: edit listing.
- `/dashboard/inquiries`: inquiry summary if exposed to owner later.
- `/dashboard/profile`: account profile.
- `/dashboard/settings`: account settings.

## Admin Routes
- `/admin`: admin overview.
- `/admin/properties`: approval queue and listing management.
- `/admin/properties/[id]`: listing review.
- `/admin/inquiries`: inquiry management.
- `/admin/users`: user management.
- `/admin/email-hub`: email logs.
- `/admin/email-hub/compose`: composer.
- `/admin/email-hub/templates`: template editor.
- `/admin/settings`: admin settings.

## Hidden/Deferred Routes
- resume parser
- document dashboard
- job applications
- billing
- team job-search dashboard

