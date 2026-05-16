# FEATURE_CLIENT_DASHBOARD

## Purpose
Give listing owners a simple dashboard to manage property submissions.

## Routes
- `/dashboard`
- `/dashboard/listings`
- `/dashboard/listings/new`
- `/dashboard/listings/[id]/edit`
- `/dashboard/inquiries`
- `/dashboard/profile`
- `/dashboard/settings`

## Dashboard Cards
- total listings
- draft listings
- pending review listings
- published listings
- rejected listings
- inquiry count

## Listing Actions
- draft: edit, submit, delete
- pending_review: view
- approved: view public, edit/resubmit, archive
- rejected: view note, edit, resubmit
- unpublished: view, resubmit if allowed
- archived: view only

## UX Rule
Every listing status must show the next recommended action.

