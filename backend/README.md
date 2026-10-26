# Backend

## Daily AMS event import

The `Import AMS events` GitHub Actions workflow runs daily at **14:17 UTC**
(6:17 a.m. Vancouver during standard time; 7:17 a.m. during daylight time).
GitHub may delay scheduled runs, so this is a daily refresh rather than an exact-time guarantee.
No running backend server or personal computer is required.

### Activate the schedule

1. Push/merge `.github/workflows/import-ams.yml` and the importer changes to the
   repository's **default branch**. Ensure GitHub Actions is enabled.
2. In GitHub, open **Settings → Secrets and variables → Actions → New repository
   secret**. Name it `DATABASE_URL` and set its value to the PostgreSQL connection
   URL for the database used by your app. Include the SSL settings required by
   your database provider. The database must accept connections from GitHub-hosted
   runners; a URL pointing to localhost or a private-only host will not work.
3. The target database must already have the repository's Prisma migrations
   applied. The importer does not run migrations.
4. Open **Actions → Import AMS events → Run workflow**, select the default branch,
   and start a manual run. Verify its logs and the resulting events in the app.
5. Confirm the next daily run appears and succeeds. No further activation is needed.

GitHub only schedules workflows on the default branch. Public repositories can
have scheduled workflows disabled after 60 days without repository activity;
re-enable the workflow in Actions if this occurs. See
[GitHub's scheduled workflow documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

### Run locally

From `backend`, install dependencies with `npm ci`, configure `DATABASE_URL` in
`backend/.env`, then run:

```sh
npm run import:ams
```

This writes to the configured database. Each source page is validated before its
first write. Existing AMS events are updated by source/external ID; only new
events receive the existing four default rooms. Existing rooms, memberships, and
messages are preserved. The import does not delete old events or detect removals
and cancellations at the source.

### Logs and failures

The workflow's **Import AMS events** step logs start/end timestamps, per-page
progress, fetched/saved totals, and duration. Requests time out after 30 seconds.
Network failures, rate limits (429), and server failures are retried up to three
attempts. `Retry-After` is respected up to two minutes; longer delays fail the
run rather than retrying early. Invalid source data or database failures fail
immediately. Raw database errors and credentials are not printed.

Failed imports exit nonzero and mark the workflow failed. Use GitHub's native
Actions notification settings for failure notifications. Inspect the failed run,
resolve the issue, then use **Re-run failed jobs** or **Run workflow**. Successful
writes before a failure remain saved; upserts make reruns safe. A concurrency
group prevents scheduled and manual imports from running simultaneously within
this repository, and a job is stopped after 15 minutes. Avoid launching a local
import against the same database while a workflow is running.
