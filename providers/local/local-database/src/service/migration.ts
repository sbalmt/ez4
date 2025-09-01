import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getUpdateQueries } from '@ez4/pgmigration';
import { DatabaseQueries } from '@ez4/pgmigration/library';
import { Client } from '@ez4/pgclient';

import { loadRepositoryState, saveRepositoryState } from '../utils/state';

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

  const query = DatabaseQueries.prepareCreate(connection.database);

  await runMigrationStatement(client, query);
};

export const ensureMigration = async (connection: ClientConnection, repository: PgTableRepository, force?: boolean) => {
  const { database } = connection;

  const client: MigrationClient = await Client.make({
    debug: false,
    repository: {},
    connection
  });

  const oldRepository = force ? {} : await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, oldRepository);

  const allQueries = [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes];

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
