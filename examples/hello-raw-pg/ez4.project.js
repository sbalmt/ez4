/**
 * Example: external Postgres (Supabase, Neon, RDS direct) via @ez4/raw-pg.
 *
 * Dev/emulator: `npm run serve` reads `localOptions.db.connectionString`.
 * Production:   `npm run deploy` reads `EZ4_RAW_PG_DB_URL` from local.env,
 *               propagates it to Lambda env, runtime constructs the client.
 *
 * @type {import('@ez4/project').ProjectOptions}
 */
export default {
  prefix: 'ez4',
  debugMode: true,
  projectName: 'hello-raw-pg',
  sourceFiles: ['./src/service.ts'],
  stateFile: {
    path: 'ez4-deploy'
  },
  localOptions: {
    // Service name `Db` → snake_case key `db`.
    db: {
      // Point at any Postgres TCP endpoint: Supabase, Neon, local docker, etc.
      connectionString: process.env.EZ4_RAW_PG_DB_URL,
      // SSL required by most managed providers (Supabase/Neon).
      // Certificate verification stays on; pass `{ ca: '<pem>' }` when the
      // provider uses a private CA instead of a publicly trusted one.
      ssl: true
    }
  },
  tags: {
    Owner: 'EZ4 Examples'
  }
};
