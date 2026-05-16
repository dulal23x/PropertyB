# FEATURE_CLIENT_DASHBOARD

## Purpose
The Client Dashboard is the operational hub for property owners to manage their listing lifecycle, view leads, and manage their account profile.

## Routes
- `/dashboard`: Overview with metrics and recent activity.
- `/dashboard/listings`: Full management of own listings (paginated/filtered).
- `/dashboard/listings/new`: Create new property draft.
- `/dashboard/listings/[id]/edit`: Update existing listing.
- `/dashboard/inquiries`: View inquiries/leads received for own listings.
- `/dashboard/profile`: Manage personal information (full name).
- `/dashboard/settings`: Account preferences and logout.

## Core Features
- **Listing Lifecycle**: Listing owners can create drafts, upload up to 10 images, and submit for admin review.
- **Next Action Intelligence**: Every listing row or card displays the logical next step based on its current status.
- **Lead Management**: Owners have visibility into inquiries submitted for their specific properties, enabling direct email responses.
- **Role-Based Security**: Access is strictly limited to authenticated owners; users can only view or modify their own data.
- **Admin Feedback**: Owners can read feedback notes left by admins on rejected or unpublished listings.

## Listing Status & Action Matrix
| Status | Actions Available | Next Action Label |
| :--- | :--- | :--- |
| **Draft** | Edit, Submit, Delete | Submit for review |
| **Pending Review** | View only | Waiting for admin review |
| **Published** | View Public, Edit/Resubmit, Archive | View public listing |
| **Rejected** | View Note, Edit, Submit, Delete | Fix and resubmit |
| **Unpublished** | Edit, Submit, Archive | Edit and resubmit |
| **Archived** | View only | View only |

## Privacy & Safety Rules
- Listing owners **never** see the user ID of buyers.
- Listing owners see buyer email and phone **only** for inquiries directed to their listings.
- Listing owners can **never** see or modify other users' listings or profiles.
- Admins entering dashboard routes are automatically redirected to `/admin`.
