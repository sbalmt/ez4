import type { RawPgEngine } from '@ez4/raw-pg';
import type { Database, Index } from '@ez4/database';
import type { UserSchema } from './types';

/**
 * External Postgres (Supabase/Neon/etc.) deployed with EZ4.
 *
 * Migrations run against the live database. Dev uses
 * `localOptions.db.connectionString`; prod uses env var
 * `EZ4_RAW_PG_DB_URL` propagated to Lambda runtime.
 */
export declare class Db extends Database.Service {
  engine: RawPgEngine;

  tables: [
    Database.UseTable<{
      name: 'users';
      schema: UserSchema;
      indexes: {
        id: Index.Primary;
        email: Index.Unique;
      };
    }>
  ];
}
