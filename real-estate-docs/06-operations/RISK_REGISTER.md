# RISK_REGISTER

## High Risks
- Reference repo accidentally edited.
- Old database reused.
- Owner phone/email leaked publicly.
- Admin approval bypassed.
- Email secrets committed.
- Old job/resume routes remain visible.

## Mitigations
- Work only in `C:\realestatesite`.
- Add startup DB guard.
- Use separate public/admin schemas.
- Test access control.
- Keep `.env` untracked.
- Search for old route labels before release.

## Product Risks
- Scope creep into full CRM.
- Payment added before listing flow is stable.
- Template UI imported wholesale and breaks build.

## Mitigation
Keep MVP narrow: listing submission, admin approval, public search, inquiry, email.

