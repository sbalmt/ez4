import type { PgMigrationQueries, PgMigrationStatement } from '@ez4/pgmigration/library';
import type { Database, Client as DbClient } from '@ez4/database';

export const runMigration = async (client: DbClient<Database.Service<any>>, queries: PgMigrationQueries) => {
  await client.transaction((transaction: DbClient<Database.Service<any>>) => {
    return runStatements(transaction, [...queries.tables, ...queries.constraints]);
  });

  await runStatements(client, [...queries.indexes, ...queries.relations]);
  await runStatements(client, queries.validations);
};

const runStatements = async (client: DbClient<Database.Service<any>>, statements: PgMigrationStatement[]) => {
  for (const { query, check } of statements) {
    if (check) {
      const [shouldSkip] = await client.rawQuery(check);

      if (shouldSkip) {
        continue;
      }
    }

    await client.rawQuery(query);
  }
};
