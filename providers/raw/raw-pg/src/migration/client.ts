import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';

import { getDeleteQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { MigrationAssertionFailedError } from '@ez4/pgmigration/library';
import { Client } from '@ez4/pgclient/driver';

import { MissingConnectionStringError } from '../common/errors';

type ApplyContext = {
  envName: string;
  database: string;
  repository: PgTableRepository;
};

const getConnection = ({ envName, database }: ApplyContext) => {
  const connectionString = process.env[envName];

  if (!connectionString) {
    throw new MissingConnectionStringError(envName, database);
  }

  return Client.make({
    debug: false,
    repository: {},
    connection: { database, connectionString }
  });
};

export const createTables = async (context: ApplyContext) => {
  return applyStepQueries(context, {});
};

export const updateTables = async (context: ApplyContext, oldRepository: PgTableRepository) => {
  return applyStepQueries(context, oldRepository);
};

export const deleteTables = async (context: ApplyContext) => {
  const client = getConnection(context);
  const queries = getDeleteQueries(context.repository);

  await runAllStatements(client, queries.tables);
};

const applyStepQueries = async (context: ApplyContext, oldRepository: PgTableRepository) => {
  const steps = getUpdateStepQueries(context.repository, oldRepository);
  const client = getConnection(context);

  const createQueries = [...steps.create.tables, ...steps.create.constraints, ...steps.create.indexes, ...steps.create.relations];
  const updateQueries = [...steps.update.tables, ...steps.update.constraints, ...steps.update.indexes, ...steps.update.relations];
  const deleteQueries = [...steps.delete.tables, ...steps.delete.constraints, ...steps.delete.indexes, ...steps.delete.relations];

  await runAllStatements(client, [...updateQueries, ...createQueries, ...deleteQueries]);

  const validations = [...steps.create.validations, ...steps.update.validations, ...steps.delete.validations];

  await runAllStatements(client, validations);
};

const runAllStatements = async (client: DbClient<Database.Service<any>>, statements: PgMigrationStatement[]) => {
  for (const query of statements) {
    await runStatement(client, query);
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
