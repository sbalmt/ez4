import type { PgMigrationQueries, PgMigrationStatement } from '@ez4/pgmigration/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import { DatabaseQueries } from '@ez4/pgmigration/library';

import { ApiClientDriver } from '../client/drivers/api';
import { MigrationFailedError } from './errors';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type ModifyDatabaseRequest = ConnectionRequest & {
  queries: PgMigrationQueries;
};

export const createDatabase = async (logger: OperationLogLine, request: ConnectionRequest): Promise<void> => {
  logger.update(`Creating database`);

  const { clusterArn, secretArn, database } = request;

  const driver = new ApiClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  const statement = DatabaseQueries.prepareCreate(database);

  await executeMigrationStatement(driver, statement);
};

export const modifyDatabase = async (logger: OperationLogLine, request: ModifyDatabaseRequest): Promise<void> => {
  logger.update(`Modifying database`);

  const { clusterArn, secretArn, database, queries } = request;

  const driver = new ApiClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const statements = [...queries.tables, ...queries.constraints, ...queries.indexes, ...queries.relations];

  await executeMigrationStatements(driver, statements);
};

export const deleteDatabase = async (logger: OperationLogLine, request: ConnectionRequest): Promise<void> => {
  logger.update(`Deleting database`);

  const { clusterArn, secretArn, database } = request;

  const driver = new ApiClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  const statement = DatabaseQueries.prepareDelete(database);

  await executeMigrationStatement(driver, statement);
};

const executeMigrationStatements = async (driver: ApiClientDriver, statements: PgMigrationStatement[]) => {
  const errors = [];

  for (const statement of statements) {
    try {
      await executeMigrationStatement(driver, statement);
    } catch (error) {
      errors.push(`${error}`);
    }
  }

  if (errors.length > 0) {
    throw new MigrationFailedError(errors);
  }
};

const executeMigrationStatement = async (driver: ApiClientDriver, statement: PgMigrationStatement) => {
  const { check, ...query } = statement;

  if (check) {
    const { records } = await driver.executeStatement({
      query: check
    });

    const [shouldSkip] = records;

    if (shouldSkip) {
      return false;
    }
  }

  await driver.executeStatement(query, {
    noErrorLog: true
  });

  return true;
};
