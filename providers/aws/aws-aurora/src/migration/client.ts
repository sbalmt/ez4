import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn } from '@ez4/aws-common';

import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';
import { prepareCreateDatabase, prepareDeleteDatabase } from '@ez4/pgmigration/library';
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

  await driver.executeStatement({
    query: prepareCreateDatabase(database)
  });
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

  const statements = [...queries.tables, ...queries.indexes, ...queries.relations].map((query) => ({ query }));

  await driver.executeTransaction(statements);
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

  const otherStatements = [...queries.tables, ...queries.relations].map((query) => ({ query }));
  const indexStatements = queries.indexes.map((query) => ({ query }));

  await driver.executeTransaction(otherStatements);
  await driver.executeStatements(indexStatements);
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

  const statements = queries.tables.map((query) => {
    return {
      query
    };
  });

  await driver.executeTransaction(statements);
};

export const deleteDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logDelete(MigrationServiceName, `${database} database`);

  const driver = new DataClientDriver({
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  });

  await driver.executeStatement({
    query: prepareDeleteDatabase(database)
  });
};
