# STORAGE_CONTRACTS

## Frontend Storage Keys
- `realestate_auth_user`: serialized auth user and JWT.
- `realestate_listing_draft`: optional local form recovery state.
- `realestate_settings`: user-facing settings cache if needed.

## Cookies
- `realestate_auth`: lightweight auth presence cookie for route guards.

## File Storage
Property images:

```text
userdata/property-images/{listing_id}/{image_id}.{ext}
```

Email logs and attachments:

```text
userdata/logs/emails
```

## Forbidden Keys
- `hiremeai_auth_user`
- `hireme_auth`
- old resume/document keys as active product storage

## Rule
Any storage key or path change requires updating this file.

