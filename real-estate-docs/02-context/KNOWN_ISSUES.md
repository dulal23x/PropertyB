# KNOWN_ISSUES

## Current
- Project name and domain are TBD.
- Existing real-estate master plan file at the project root appears encoding-corrupted for Bangla text.
- The future implementation must verify whether the target folder already contains unrelated screenshots or artifacts before turning it into a git project.

## Risks To Recheck During Build
- Old reference DB path accidentally reused.
- Old auth storage key or cookie left in frontend.
- Old brand/email sender copied into production config.
- Public response leaks owner private data.
- Old dashboard routes remain visible.

## Recently Hardened
- Backend runtime now fail-closes on unsafe ClearlyHired DB paths.
- Public listing payload contract has dedicated tests to guard against owner/admin data leaks.
- Admin inquiries listing no longer performs per-row listing lookup queries.
