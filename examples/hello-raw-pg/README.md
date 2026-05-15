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

At deploy time the `@ez4/raw-pg` provider reads `EZ4_RAW_PG_DB_URL` from
your env and propagates it to the deployed Lambda as a runtime env var.
The Lambda constructs the Postgres client from that env var via
`@ez4/raw-pg/client`'s `Client.make({ connection: { connectionString, ... } })`.

**Env var convention:** `EZ4_RAW_PG_<SERVICE_NAME>_URL` (snake-uppercase).
Service named `Db` → `EZ4_RAW_PG_DB_URL`.

## Limitations (v0.2)

- The connection string lives in the Lambda's plaintext env (visible in
  AWS console). For production secret hygiene, use AWS Secrets Manager
  or Parameter Store + a custom resolver (future scope).
- No `CREATE DATABASE` — the target database must exist before deploy.
- Reset (`ez4 serve --reset`) drops only the configured tables, not the
  database itself.
