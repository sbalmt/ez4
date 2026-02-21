import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn, OperationLogLine } from '@ez4/aws-common';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { DatabaseQueries } from '@ez4/pgmigration/library';

import { DataClientDriver } from '../client/driver';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type CreateTableRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export type UpdateTableRequest = ConnectionRequest & {
  repository: {
    target: PgTableRepository;
    source: PgTableRepository;
  };
};

export type DeleteTableRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export const createDatabase = async (logger: OperationLogLine, request: ConnectionRequest): Promise<void> => {
  logger.update(`Creating database`);

  const { clusterArn, secretArn, database } = request;

  const driver = new DataClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  await executeMigrationStatement(driver, DatabaseQueries.prepareCreate(database));
};

export const createTables = async (logger: OperationLogLine, request: CreateTableRequest): Promise<void> => {
  logger.update(`Creating tables`);

  const { clusterArn, secretArn, database, repository } = request;

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getCreateQueries(repository);

  await executeMigrationTransaction(driver, [
    ...queries.tables,
    ...queries.constraints,
    ...queries.relations,
    ...queries.indexes,
    ...queries.validations
  ]);
};

export const updateTables = async (logger: OperationLogLine, request: UpdateTableRequest): Promise<void> => {
  logger.update(`Updating tables`);

  const { clusterArn, secretArn, database, repository } = request;

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getUpdateQueries(repository.target, repository.source);

  await executeMigrationTransaction(driver, [...queries.tables, ...queries.constraints, ...queries.relations]);
  await executeMigrationStatements(driver, queries.indexes);
  await executeMigrationStatements(driver, queries.validations);
};

export const deleteTables = async (logger: OperationLogLine, request: DeleteTableRequest): Promise<void> => {
  logger.update(`Deleting tables`);

  const { clusterArn, secretArn, database, repository } = request;

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getDeleteQueries(repository);

  await executeMigrationTransaction(driver, queries.tables);
};

export const deleteDatabase = async (logger: OperationLogLine, request: ConnectionRequest): Promise<void> => {
  logger.update(`Deleting database`);

  const { clusterArn, secretArn, database } = request;

  const driver = new DataClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  await executeMigrationStatement(driver, DatabaseQueries.prepareDelete(database));
};

const executeMigrationTransaction = async (driver: DataClientDriver, statements: PgMigrationStatement[]) => {
  const transactionId = await driver.beginTransaction();

  try {
    await executeMigrationStatements(driver, statements);
    await driver.commitTransaction(transactionId);
  } catch (error) {
    await driver.rollbackTransaction(transactionId);
    throw error;
  }
};

const executeMigrationStatements = async (driver: DataClientDriver, statements: PgMigrationStatement[]) => {
  for (const statement of statements) {
    await executeMigrationStatement(driver, statement);
  }
};

const executeMigrationStatement = async (driver: DataClientDriver, statement: PgMigrationStatement) => {
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
    noTimeout: true
  });

  return true;
};
