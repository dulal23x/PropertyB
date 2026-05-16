# SAFE_EDIT_ZONES

## Safe To Edit After Clone
- `backend/app/**`
- `backend/scripts/**`
- `backend/requirements.txt`
- `nextjs-frontend/src/**`
- `nextjs-frontend/next.config.ts`
- `docs/**`
- root docs and rules files

## Edit With Caution
- `nextjs-frontend/public/**`
- `docker-compose.yml`
- deployment config
- image storage paths

## Do Not Edit Directly
- `C:\ClearlyHired/**`
- generated build folders
- dependency folders
- runtime DB files unless the task is DB setup/migration
- `.env` files with real secrets

## Rule
If a file appears safe by folder but is generated, secret-bearing, or reference-only, the more restrictive rule wins.

