import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationQueries } from '@ez4/pgmigration/library';

export const runMigration = (client: DbClient<Database.Service>, queries: PgMigrationQueries) => {
  const statements = [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes];

  return client.transaction(async (transaction: DbClient<Database.Service>) => {
    for (const { query, check } of statements) {
      if (check) {
        const [shouldSkip] = await transaction.rawQuery(check);

        if (shouldSkip) {
          continue;
        }
      }

      await transaction.rawQuery(query);
    }
  });
};
