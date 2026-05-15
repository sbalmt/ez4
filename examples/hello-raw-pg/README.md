# hello-raw-pg

Example EZ4 service that talks to **any Postgres reachable over TCP** —
Supabase, Neon, fly.io Postgres, RDS direct, local docker — via the
`@ez4/raw-pg` provider.

Use this seed when you want EZ4's schema-as-types + auto-migrations against
a managed Postgres instead of AWS Aurora.

## Setup

```sh
cp example.env local.env
# edit local.env and paste your connection string
npm install
```

## Dev / migrations

```sh
npm run serve
```

`ez4 serve` reads `localOptions.db.connectionString` from `ez4.project.js`
(which itself reads `EZ4_RAW_PG_DB_URL` from `local.env`) and runs
`getUpdateQueries` against the live database. Subsequent runs diff the
table repository state and apply only changed statements.

## Production deploy

```sh
npm run deploy
```

At deploy time the `@ez4/raw-pg` provider:

1. Reads `EZ4_RAW_PG_DB_URL` from your env.
2. Runs `getUpdateQueries` against the live database — same migration
   logic as `ez4 serve`, but persisted in the deploy state file so future
   deploys only apply the delta.
3. Propagates the env var to the deployed Lambda so the runtime can
   construct an `@ez4/raw-pg/client` `Client.make({ connection: { connectionString } })`.

**Env var convention:** `EZ4_RAW_PG_<SERVICE_NAME>_URL` (snake-uppercase).
Service named `Db` → `EZ4_RAW_PG_DB_URL`.

See `providers/raw/raw-pg/README.md` for limitations (plaintext env,
no `CREATE DATABASE`, table-scoped reset).
