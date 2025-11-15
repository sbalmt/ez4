import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getUpdateQueries } from '@ez4/pgmigration';
import { DatabaseQueries } from '@ez4/pgmigration/library';
import { Client } from '@ez4/pgclient';

import { loadRepositoryState, saveRepositoryState } from './state';

type MigrationClient = DbClient<Database.Service>;

export const createAllTables = async (connection: ClientConnection, repository: PgTableRepository, options: ServeOptions) => {
  await createDatabase(connection);

  const client: MigrationClient = Client.make({
    debug: false,
    repository: {},
    connection
  });

  const { database } = connection;

  const oldRepository = options.force ? {} : await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, oldRepository);

  const allQueries = [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes];

  await client.transaction(async (transaction: MigrationClient) => {
    for (const query of allQueries) {
      await runStatement(transaction, query);
    }
  });

  await saveRepositoryState(database, repository);
};

export const deleteAllTables = async (connection: ClientConnection, options: ServeOptions) => {
  if (options.reset) {
    await deleteDatabase(connection);
  }
};

const createDatabase = async (connection: ClientConnection) => {
  const client: MigrationClient = Client.make({
    debug: false,
    repository: {},
    connection: {
      ...connection,
      database: 'postgres'
    }
  });

  const query = DatabaseQueries.prepareCreate(connection.database);

  await runStatement(client, query);
};

const deleteDatabase = async (connection: ClientConnection) => {
  const client: MigrationClient = Client.make({
    debug: false,
    repository: {},
    connection: {
      ...connection,
      database: 'postgres'
    }
  });

  const query = DatabaseQueries.prepareDelete(connection.database);

  await runStatement(client, query);
};

const runStatement = async (client: MigrationClient, statement: PgMigrationStatement) => {
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
