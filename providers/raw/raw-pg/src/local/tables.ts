import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';

import { loadRepositoryState, saveRepositoryState } from './state';

export const createAllTables = async (connection: ClientConnection, repository: PgTableRepository, options: ServeOptions) => {
  const { database } = connection;

  const freshCreation = options.force || options.reset;
  const oldRepository = freshCreation ? {} : await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, oldRepository);
  const client = getClient(connection);

  await client.transaction((transaction: DbClient<Database.Service<any>>) => {
    return runAllStatements(transaction, [...queries.tables, ...queries.constraints]);
  });

  await runAllStatements(client, [...queries.indexes, ...queries.relations]);
  await runAllStatements(client, queries.validations);

  await saveRepositoryState(database, repository);
};

export const deleteAllTables = async (connection: ClientConnection, repository: PgTableRepository) => {
  const queries = getDeleteQueries(repository);
  const client = getClient(connection);

  await runAllStatements(client, queries.tables);

  await saveRepositoryState(connection.database, {});
};

const runAllStatements = async (client: DbClient<Database.Service<any>>, statements: PgMigrationStatement[]) => {
  for (const query of statements) {
    await runStatement(client, query);
  }
};

const runStatement = async (client: DbClient<Database.Service<any>>, statement: PgMigrationStatement) => {
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
