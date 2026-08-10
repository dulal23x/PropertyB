# BACKUP_AND_RECOVERY

## Data To Back Up
- `app/backend/realestate_mvp_v1.db`
- `app/backend/userdata/property-images`
- email log attachments if used
- production `.env` stored securely outside git
- `migration/propertybikri-runtime-assets-YYYYMMDD.tar.gz` when preparing a portable git migration bundle

## Local Backup Command Example
```powershell
Copy-Item C:\realestatesite\app\backend\realestate_mvp_v1.db C:\realestatesite\backups\realestate_mvp_v1_YYYYMMDD.db
```

## Recovery Priorities
1. Restore DB.
2. Restore property images.
3. Restore environment variables.
4. Start backend.
5. Start frontend.
6. Verify admin login and public listing.

## Rule
Never treat old reference DBs as fallback production data.

For full VPS migration, use `real-estate-docs/06-operations/PROPERTYBIKRI_VPS_MIGRATION.md`.
