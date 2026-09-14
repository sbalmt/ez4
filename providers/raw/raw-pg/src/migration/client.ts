import type { Database, Client as DbClient } from '@ez4/database';
import type { PgMigrationStatement, PgValidationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';

import { getDeleteQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { MigrationAssertionFailedError, MigrationValidationFailedError } from '@ez4/pgmigration/library';
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

  const prepareQueries = [...steps.prepare.tables, ...steps.prepare.constraints, ...steps.prepare.indexes, ...steps.prepare.relations];
  const rolloutQueries = [...steps.rollout.tables, ...steps.rollout.constraints, ...steps.rollout.indexes, ...steps.rollout.relations];
  const cleanupQueries = [...steps.cleanup.tables, ...steps.cleanup.constraints, ...steps.cleanup.indexes, ...steps.cleanup.relations];

  await runAllStatements(client, [...prepareQueries, ...rolloutQueries, ...cleanupQueries]);

  const validations = [...steps.prepare.validations, ...steps.rollout.validations, ...steps.cleanup.validations];

  await runAllValidations(client, validations);
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
