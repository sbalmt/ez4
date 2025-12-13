import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getUpdateQueries } from '@ez4/pgmigration';
import { DatabaseQueries } from '@ez4/pgmigration/library';
import { Client } from '@ez4/pgclient';

import { loadRepositoryState, saveRepositoryState } from './state';

export const createAllTables = async (connection: ClientConnection, repository: PgTableRepository, options: ServeOptions) => {
  await ensureDatabase(connection);

  const { database } = connection;

  const client = getClient(connection);

  const freshCreation = options.force || options.reset;

  const oldRepository = freshCreation ? {} : await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, oldRepository);

  await client.transaction((transaction: DbClient<Database.Service>) => {
    return runAllStatements(transaction, [...queries.tables, ...queries.constraints, ...queries.relations]);
  });

  await runAllStatements(client, queries.indexes);

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

const runAllStatements = async (client: DbClient<Database.Service>, statements: PgMigrationStatement[]) => {
  for (const query of statements) {
    await runStatement(client, query);
  }
};

const runStatement = async (client: DbClient<Database.Service>, statement: PgMigrationStatement) => {
  const { check, query } = statement;

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
