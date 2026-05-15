# @ez4/raw-pg

EZ4 provider for **external Postgres** — connect to any Postgres-compatible
server reachable over TCP (Supabase, Neon, fly.io Postgres, Railway, RDS
direct, self-hosted) instead of provisioning AWS Aurora.

The same `Database.Service` declarations work; only the engine name changes.
Auto-migrations apply against the live database in both dev and production.

## Install

```sh
npm install @ez4/raw-pg
```

In your app code, import the engine type and reference it in the service:

```ts
import type { RawPgEngine } from '@ez4/raw-pg';
import type { Database, Index } from '@ez4/database';

export declare class Db extends Database.Service {
  engine: RawPgEngine;
  tables: [
    Database.UseTable<{
      name: 'users';
      schema: UserSchema;
      indexes: { id: Index.Primary };
    }>
  ];
}
```

Register the provider in your `ez4.project.js` (any import is enough — the
side effect registers triggers):

```js
import '@ez4/raw-pg';

export default {
  prefix: 'ez4',
  projectName: 'my-app',
  sourceFiles: ['./src/service.ts'],
  // ...
};
```

## Connection string convention

The provider reads the connection string from an environment variable named
after the service:

```
EZ4_RAW_PG_<SERVICE_NAME_SNAKE_UPPER>_URL
```

Examples:
- Service `Db` → `EZ4_RAW_PG_DB_URL`
- Service `MyDatabase` → `EZ4_RAW_PG_MY_DATABASE_URL`

The variable is required at deploy time and propagated to the deployed
Lambda as a runtime env var.

## Local development

`ez4.project.js`:

```js
export default {
  // ...
  localOptions: {
    db: {
      connectionString: process.env.EZ4_RAW_PG_DB_URL,
      ssl: { rejectUnauthorized: false }   // most managed providers
    }
  }
};
```

`local.env`:

```
EZ4_RAW_PG_DB_URL=postgres://user:pass@host:5432/db?sslmode=require
```

Then:

```sh
ez4 serve -e local.env
```

This connects to the live database, diffs the table repository against
the cached state in `.ez4/`, and applies `getUpdateQueries` (create tables,
add columns, indexes, constraints, relations). The cached state lets
subsequent runs skip already-applied statements.

Reset (drops the tables in your repository — does not drop the database):

```sh
ez4 serve --reset
```

## Production deploy

Same env var. Set it in your CI / deploy environment:

```sh
export EZ4_RAW_PG_DB_URL=postgres://user:pass@host:5432/db?sslmode=require
ez4 deploy -e local.env
```

What happens during deploy:

1. **`prepareResources`** validates the env var is present and registers a
   `raw:pg.migration` state entry containing the target table repository.
2. **Migration apply** (a stateful step) opens a TCP connection to the
   Postgres URL and runs `getUpdateQueries` between the previous repository
   stored in state and the current target. Same diff logic as dev. On first
   deploy this creates all tables; on subsequent deploys it applies only
   the delta.
3. **`prepareLinkedService`** emits a `ContextSource` that constructs the
   `@ez4/raw-pg/client` `Client` at runtime, reading
   `process.env.EZ4_RAW_PG_<NAME>_URL`. The deploy-time env value is
   propagated to the Lambda as a runtime env var.
4. The Lambda (or any consuming service) gets a typed `Client<Db>` with
   the full EZ4 query API.

Destroying:

```sh
ez4 destroy --force
```

Destroy drops the migration state entry. By default this does **not** drop
the actual tables — pass `allowDeletion: true` in the migration parameters
or use `--force` to enable destructive cleanup. Same data safety stance as
`@ez4/aws-aurora`.

## Limitations

- **Plaintext env**: the connection string ends up in the Lambda's env vars,
  visible in the AWS console. For stricter secret hygiene, swap the env-var
  flow for AWS Secrets Manager / SSM Parameter Store and add a custom
  client constructor.
- **No `CREATE DATABASE`**: the target database must already exist. Managed
  providers like Supabase create it for you.
- **Reset is table-scoped**, not database-scoped, since most managed
  providers don't grant `DROP DATABASE`.
- **No connection pooling at the EZ4 layer beyond `pg.Pool`**: each Lambda
  cold start spins up its own pool. For Supabase, point at the PgBouncer
  port (typically `6543`) for higher concurrency.

## See also

- `examples/hello-raw-pg` — minimal seed using this provider.
- `@ez4/aws-aurora` — same query surface against AWS-managed Aurora.
- `@ez4/pgclient` — the shared SQL layer underneath both providers.
