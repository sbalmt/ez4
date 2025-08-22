import type { PgMigrationStatement } from '@ez4/pgmigration/library';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn } from '@ez4/aws-common';

import { prepareCreateDatabase, prepareDeleteDatabase } from '@ez4/pgmigration/library';
import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { Logger } from '@ez4/aws-common';

import { DataClientDriver } from '../client/driver.js';
import { MigrationServiceName } from './types.js';

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

export const createDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logCreate(MigrationServiceName, `${database} database`);

  const driver = new DataClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  await executeMigrationStatement(driver, prepareCreateDatabase(database));
};

export const createTables = async (request: CreateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository } = request;

  Logger.logCreate(MigrationServiceName, `${database} tables`);

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getCreateQueries(repository);

  await executeMigrationTransaction(driver, [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes]);
};

export const updateTables = async (request: UpdateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository } = request;

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getUpdateQueries(repository.target, repository.source);

  await executeMigrationTransaction(driver, [...queries.tables, ...queries.constraints, ...queries.relations]);
  await executeMigrationStatements(driver, queries.indexes);
};

export const deleteTables = async (request: DeleteTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository } = request;

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const queries = getDeleteQueries(repository);

  await executeMigrationTransaction(driver, queries.tables);
};

export const deleteDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logDelete(MigrationServiceName, `${database} database`);

  const driver = new DataClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  await executeMigrationStatement(driver, prepareDeleteDatabase(database));
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
  const { check, query } = statement;

  if (check) {
    const [done] = await driver.executeStatement({
      query: check
    });

    if (done) {
      return false;
    }
  }

  await driver.executeStatement({
    query
  });

  return true;
};
