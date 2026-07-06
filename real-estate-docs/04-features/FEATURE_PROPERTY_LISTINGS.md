# FEATURE_PROPERTY_LISTINGS

## Purpose
Let authenticated users create property and land listings that become public only after admin approval.

## Listing Lifecycle
- `draft`
- `pending_review`
- `approved`
- `rejected`
- `unpublished`
- `archived`

## Owner Capabilities
- Create draft.
- Edit own draft/rejected listing.
- Upload listing images.
- Submit for review.
- View status and admin feedback.
- Archive own listing where allowed.

## Admin Capabilities
- View all listings.
- Review pending listings.
- Approve listings.
- Reject listings with required note.
- Unpublish listings.
- Edit listing corrections.
- View owner data and audit timeline.

## Public Rule
Only `approved` listings appear publicly. Public response must use a public schema and must include business phone, not owner phone.

## Required Property Categories
- apartment
- house
- land
- commercial
- office
- shop
- warehouse
- factory
- other

## Required Listing Purposes
- sale
- rent

