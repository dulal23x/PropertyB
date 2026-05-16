# TESTING_PLAYBOOK

## Backend Tests
Required scenarios:

- register/login
- create listing draft
- submit listing
- pending listing not public
- admin approves listing
- approved listing public
- admin rejects listing with note
- owner sees rejection note
- public does not see rejection note
- public response hides owner phone/email
- public response includes business phone
- inquiry creates row
- inquiry logs/sends admin email
- non-admin cannot approve
- other user cannot edit listing

## Frontend Tests
Required scenarios:

- visitor opens homepage
- visitor searches properties
- visitor opens listing detail
- visitor sees business phone
- visitor submits inquiry
- user signs up and creates listing
- user submits listing
- admin approves listing
- approved listing appears publicly
- admin rejects listing
- owner sees rejection reason

## Commands
```powershell
cd C:\realestatesite\app\backend
python -m pytest
```

```powershell
cd C:\realestatesite\app\nextjs-frontend
npm run lint
npm run build
npm run test:e2e
```

## Manual Smoke
Manual smoke is acceptable only if automated test setup is not yet stable. Record exact routes, users, and results in the handoff.

