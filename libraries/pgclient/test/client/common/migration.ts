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
  for (const { assert, check, query } of statements) {
    if (assert) {
      const [shouldFail] = await client.rawQuery(assert);

      if (shouldFail) {
        throw new Error(`Migration assertion failed for statement.`);
      }
    }

    if (check) {
      const [shouldSkip] = await client.rawQuery(check);

      if (shouldSkip) {
        continue;
      }
    }

    await client.rawQuery(query);
  }
};
