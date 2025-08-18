import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationQuery } from '@ez4/pgmigration/library';

export const runMigration = (client: DbClient<Database.Service>, queries: PgMigrationQuery[]) => {
  return client.transaction(async (transaction: DbClient<Database.Service>) => {
    for (const { query, check } of queries) {
      if (check) {
        const [done] = await transaction.rawQuery(check);

        if (done) {
          continue;
        }
      }

      await transaction.rawQuery(query);
    }
  });
};
