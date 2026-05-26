# ROLLBACK_AND_RECOVERY_RUNBOOK

## Purpose
Fast restore playbook for production incidents after deploy.

## Trigger Conditions
Run rollback if any of the following happens:
- `api.propertybikri.com/health` fails for 2+ minutes
- Frontend returns 5xx on critical routes
- Public routes leak private owner data
- Listing create/submit flow breaks
- Admin approval flow breaks

## Preconditions
- Previous release still exists under `/srv/propertybikri/releases/<old-release>`
- DB backup exists for pre-deploy point
- App service user has permission to restore shared data

## 1) Emergency Containment
```bash
sudo systemctl status propertybikri-backend propertybikri-frontend --no-pager
sudo tail -n 200 /var/log/nginx/error.log
sudo journalctl -u propertybikri-backend -n 200 --no-pager
sudo journalctl -u propertybikri-frontend -n 200 --no-pager
```

If incident is severe data/privacy exposure:
1. Restrict external access at load balancer/firewall temporarily.
2. Keep SSH access only from trusted admin IPs.
3. Continue rollback immediately.

## 2) Release Rollback (Code Level)
```bash
export PREV_RELEASE=<previous-release-id>
sudo ln -sfn /srv/propertybikri/releases/$PREV_RELEASE /srv/propertybikri/current
sudo systemctl restart propertybikri-backend propertybikri-frontend
```

## 3) Data Rollback (If Required)
Restore only if data corruption/regression is confirmed.

```bash
sudo systemctl stop propertybikri-backend
cp /srv/propertybikri/shared/data/db/realestate_mvp_v1.db /srv/propertybikri/shared/data/db/realestate_mvp_v1.db.pre-restore.$(date +%Y%m%d-%H%M%S)
cp <backup-path>/realestate_mvp_v1.db /srv/propertybikri/shared/data/db/realestate_mvp_v1.db
sudo chown propertybikri:propertybikri /srv/propertybikri/shared/data/db/realestate_mvp_v1.db
sudo systemctl start propertybikri-backend
```

For image directory rollback:
```bash
rsync -a --delete <backup-path>/property-images/ /srv/propertybikri/shared/data/property-images/
sudo chown -R propertybikri:propertybikri /srv/propertybikri/shared/data/property-images
```

## 4) Verification After Rollback
```bash
curl -sS https://api.propertybikri.com/health
curl -sS https://api.propertybikri.com/health/email
curl -I https://propertybikri.com
curl -I https://www.propertybikri.com
```

Functional checks:
1. Public search and detail route return 200.
2. Private owner data is still hidden in public responses.
3. Auth login works.
4. Listing submit and admin approval path works.

## 5) Post-Incident Documentation
Record:
- Incident start/end time
- Release ID rolled back from/to
- Root cause summary
- Whether DB restore was performed
- Permanent fix owner and timeline

If root cause is dependency drift:
1. Rebuild lock files.
2. Re-run clean environment deploy rehearsal.
3. Block redeploy until checklist is green.

## 6) Prevention Controls
- Never deploy without:
  - backend lock file install
  - frontend `npm ci`
  - health and smoke checks
- Keep at least 3 previous releases on disk.
- Keep daily DB and image backups with retention.
