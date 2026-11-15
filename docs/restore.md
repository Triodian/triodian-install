# Backup and restore of a client deployment

How a client deployment's data is backed up and put back, and the record of each time the restore was exercised.
Written for security review item S.8 (15 November 2026). Until the table at the end shows a run that passed, the
procedure is **written but untested**, and [security-answers.md](security-answers.md) says so.

## What there is to back up

| Data | Where | Database |
| --- | --- | --- |
| People, their roles in each app, sessions, the bootstrap flag | the shared identity database | `triodian-identity-<code>` |
| Each app's engagement, its recent revisions, archive, audit log, notifications outbox, access requests | the app's own database | `<worker>-<code>` (for example `use-assessment-<code>`) |
| Worker secrets (`ACCESS_AUD`, `DEMO_SESSION_KEY` where set) | Cloudflare, not in any database | re-created by `install.mjs` or set by hand |
| The app code and configuration | GitHub (the release pinned in `releases.json`) and `wrangler.<code>.json` beside each app | re-fetched by `install.mjs` |

Cloudflare D1 also keeps its own point-in-time history for 30 days ([Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)),
which covers a mistaken save or a bad migration without any export. The export below is for everything Time Travel
does not cover: a deleted database, a closed account, moving to another account or cloud, and the client's own right
to a copy.

## Backup

Run from the folder `install.mjs` fetched the apps into, with the client's `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` set. One SQL file per database; the file holds schema and data.

```sh
DATE=$(date -u +%Y%m%dT%H%MZ); CODE=<code>; mkdir -p backups/$DATE
npx --yes wrangler@4 d1 export triodian-identity-$CODE --remote --output backups/$DATE/identity.sql
for w in risk-appetite use-assessment confidentiality-exposure-assessment board-direction; do
  npx --yes wrangler@4 d1 export $w-$CODE --remote --output backups/$DATE/$w.sql 2>/dev/null || true   # only the apps the client has
done
```

Keep the folder where the client's agreement says (encrypted at rest; it holds names, email addresses and the
engagement record). The engagement JSON each app exports from its own Outputs screen is a second, human-readable copy.

## Restore

Into the same databases (after a deletion or corruption) or into new ones (another account, a rebuilt install):

1. If the databases are gone, run `install.mjs` for the client again. It creates empty databases and deploys the pinned
   release. Stop before anyone signs in.
2. Import each file into its database. The import replaces nothing by itself: on a non-empty database, drop the tables
   first, or create fresh databases.
   ```sh
   npx --yes wrangler@4 d1 execute triodian-identity-$CODE --remote --file backups/$DATE/identity.sql
   npx --yes wrangler@4 d1 execute use-assessment-$CODE --remote --file backups/$DATE/use-assessment.sql   # and so on
   ```
3. Check: sign in as an existing administrator (not through `FIRST_ADMINS`: the identity export carries
   `app_settings.bootstrap_closed`, so bootstrap stays closed), open each app, confirm the engagement's revision number
   and the last history entry match what the client last saw, and that Admin lists the same people and roles.
4. Record the run in the table below.

For a point-in-time restore within 30 days, `wrangler d1 time-travel restore <database> --timestamp=<ISO time>`
instead of steps 1 and 2, then step 3.

## Record of restore exercises

| Date | Client or test account | Who | From | Into | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | **not yet run** | First run is planned on the Triodian test account (test-c), plan task S.8 |
