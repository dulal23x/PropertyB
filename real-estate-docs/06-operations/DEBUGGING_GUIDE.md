# DEBUGGING_GUIDE

## First Checks
- Confirm current directory is under `C:\realestatesite`.
- Confirm DB path is `realestate_mvp_v1.db`.
- Confirm backend runs on `8090`.
- Confirm frontend runs on `3010`.
- Confirm frontend API URL points to `8090`.

## Common Issues
Old auth state:

- Clear localStorage key `realestate_auth_user`.
- Clear cookie `realestate_auth`.

Pending listing visible publicly:

- Check public query includes `status=approved`.
- Check public route uses public schema.

Owner phone leak:

- Inspect public API JSON.
- Inspect rendered HTML.
- Check public schema excludes owner relation.

Email not sending:

- Check `EMAIL_PROVIDER`.
- Check console logs in dev.
- Check SMTP env in production.
- Check email logs table.

