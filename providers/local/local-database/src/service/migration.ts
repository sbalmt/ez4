import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getUpdateQueries } from '@ez4/pgmigration';
import { prepareCreateDatabase } from '@ez4/pgmigration/library';
import { Client } from '@ez4/pgclient';

import { loadRepositoryState, saveRepositoryState } from '../utils/state.js';

type MigrationClient = DbClient<Database.Service>;

export const ensureDatabase = async (connection: ClientConnection) => {
  const client: MigrationClient = await Client.make({
    debug: false,
    repository: {},
    connection: {
      ...connection,
      database: 'postgres'
    }
  });

  const query = prepareCreateDatabase(connection.database);

  await runMigrationStatement(client, query);
};

export const ensureMigration = async (connection: ClientConnection, repository: PgTableRepository) => {
  const { database } = connection;

  const client: MigrationClient = await Client.make({
    debug: false,
    repository: {},
    connection
  });

  const currentRepository = await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, currentRepository);

  const allQueries = [...queries.tables, ...queries.indexes, ...queries.relations];

  await client.transaction(async (transaction: MigrationClient) => {
    for (const query of allQueries) {
      await runMigrationStatement(transaction, query);
    }
  });

  await saveRepositoryState(database, repository);
};

const runMigrationStatement = async (client: MigrationClient, statement: PgMigrationStatement) => {
  const { check, query } = statement;

  if (check) {
    const [done] = await client.rawQuery(check);

    if (done) {
      return;
    }
  }

  await client.rawQuery(query);
};
