import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement, PgValidationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '@ez4/pgclient';

import { DatabaseQueries, MigrationAssertionFailedError, MigrationValidationFailedError } from '@ez4/pgmigration/library';
import { getUpdateStepQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient/driver';

import { loadRepositoryState, saveRepositoryState } from './state';

export const createAllTables = async (connection: ClientConnection, repository: PgTableRepository, options: ServeOptions) => {
  await ensureDatabase(connection);

  const { database } = connection;

  const freshCreation = options.force || options.reset;
  const oldRepository = freshCreation ? {} : await loadRepositoryState(database);

  const steps = getUpdateStepQueries(repository, oldRepository);
  const client = getClient(connection);

  for (const queries of [steps.prepare, steps.rollout, steps.cleanup]) {
    await runAllStatements(client, [...queries.tables, ...queries.constraints, ...queries.indexes, ...queries.relations]);
    await runAllValidations(client, queries.validations);
  }

  await saveRepositoryState(database, repository);
};

export const deleteAllTables = async (connection: ClientConnection) => {
  const query = DatabaseQueries.prepareDelete(connection.database);

  const client = getClient({
    ...connection,
    database: 'postgres'
  });

  await runStatement(client, query);
};

const ensureDatabase = async (connection: ClientConnection) => {
  const query = DatabaseQueries.prepareCreate(connection.database);

  const client = getClient({
    ...connection,
    database: 'postgres'
  });

  await runStatement(client, query);
};

const runAllStatements = async (client: DbClient<Database.Service<any>>, statements: PgMigrationStatement[]) => {
  for (const query of statements) {
    await runStatement(client, query);
  }
};

const runAllValidations = async (client: DbClient<Database.Service<any>>, validations: PgValidationStatement[]) => {
  for (const { name, check } of validations) {
    const [hasError] = await client.rawQuery(check);

    if (hasError) {
      throw new MigrationValidationFailedError(name);
    }
  }
};

const runStatement = async (client: DbClient<Database.Service<any>>, statement: PgMigrationStatement) => {
  const { name, assert, check, query } = statement;

  if (assert) {
    const [shouldFail] = await client.rawQuery(assert);

    if (shouldFail) {
      throw new MigrationAssertionFailedError(name);
    }
  }

  if (check) {
    const [shouldSkip] = await client.rawQuery(check);

    if (shouldSkip) {
      return false;
    }
  }

  await client.rawQuery(query);

  return true;
};

const getClient = (connection: ClientConnection) => {
  return Client.make({
    debug: false,
    repository: {},
    connection
  });
};
