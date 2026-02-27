import type { PgMigrationQueries, PgMigrationStatement } from '@ez4/pgmigration/library';
import type { Database, Client as DbClient } from '@ez4/database';

export const runMigration = async (client: DbClient<Database.Service>, queries: PgMigrationQueries) => {
  await client.transaction((transaction: DbClient<Database.Service>) => {
    return runStatements(transaction, [...queries.tables, ...queries.constraints, ...queries.relations]);
  });

  await runStatements(client, queries.indexes);
  await runStatements(client, queries.validations);
};

const runStatements = async (client: DbClient<Database.Service>, statements: PgMigrationStatement[]) => {
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
