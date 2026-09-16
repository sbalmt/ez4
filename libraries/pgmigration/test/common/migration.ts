import type { PgMigrationQueries, PgMigrationStatement, PgValidationStatement } from '@ez4/pgmigration/library';
import type { Database, Client as DbClient } from '@ez4/database';

import { MigrationAssertionFailedError, MigrationValidationFailedError } from '@ez4/pgmigration/library';

export const runMigration = async (client: DbClient<Database.Service<any>>, queries: PgMigrationQueries) => {
  await runStatements(client, [...queries.tables, ...queries.constraints, ...queries.indexes, ...queries.relations]);

  await runValidations(client, queries.validations);
};

const runStatements = async (client: DbClient<Database.Service<any>>, statements: PgMigrationStatement[]) => {
  for (const { name, assert, check, query } of statements) {
    if (assert) {
      const [shouldFail] = await client.rawQuery(assert);

      if (shouldFail) {
        throw new MigrationAssertionFailedError(name);
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

const runValidations = async (client: DbClient<Database.Service<any>>, validations: PgValidationStatement[]) => {
  for (const { name, check } of validations) {
    const [hasError] = await client.rawQuery(check);

    if (hasError) {
      throw new MigrationValidationFailedError(name);
    }
  }
};
