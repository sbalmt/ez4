import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';

import { getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Client } from '@ez4/pgclient';

import { MissingConnectionStringAtApplyError } from './errors';

type ApplyContext = {
  envName: string;
  database: string;
  repository: PgTableRepository;
};

const getConnection = ({ envName, database }: ApplyContext) => {
  const connectionString = process.env[envName];

  if (!connectionString) {
    throw new MissingConnectionStringAtApplyError(envName, database);
  }

  return Client.make({
    debug: false,
    repository: {},
    connection: { database, connectionString }
  });
};

export const createTables = async (context: ApplyContext) => {
  const client = getConnection(context);
  const queries = getUpdateQueries(context.repository, {});

  await client.transaction((tx: DbClient<Database.Service<any>>) => {
    return runAllStatements(tx, [...queries.tables, ...queries.constraints]);
  });

  await runAllStatements(client, [...queries.indexes, ...queries.relations]);
  await runAllStatements(client, queries.validations);
};

export const updateTables = async (context: ApplyContext, oldRepository: PgTableRepository) => {
  const client = getConnection(context);
  const queries = getUpdateQueries(context.repository, oldRepository);

  await client.transaction((tx: DbClient<Database.Service<any>>) => {
    return runAllStatements(tx, [...queries.tables, ...queries.constraints]);
  });

  await runAllStatements(client, [...queries.indexes, ...queries.relations]);
  await runAllStatements(client, queries.validations);
};

export const deleteTables = async (context: ApplyContext) => {
  const client = getConnection(context);
  const queries = getDeleteQueries(context.repository);

  await runAllStatements(client, queries.tables);
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
