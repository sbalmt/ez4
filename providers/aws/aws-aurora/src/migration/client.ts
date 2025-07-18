import type { PgIndexRepository, PgRelationRepository, PgTableRepository } from '@ez4/pgclient/library';
import type { AnySchema } from '@ez4/schema';
import type { Arn } from '@ez4/aws-common';

import { Logger } from '@ez4/aws-common';

import { prepareCreateColumns, prepareUpdateColumns, prepareDeleteColumns, prepareRenameColumns } from './common/columns.js';
import { prepareCreateRelations, prepareDeleteRelations } from './common/relations.js';
import { prepareCreateDatabase, prepareDeleteDatabase } from './common/database.js';
import { prepareCreateIndexes, prepareUpdateIndexes } from './common/indexes.js';
import { prepareCreateTable, prepareDeleteTable } from './common/table.js';
import { MigrationServiceName } from './types.js';
import { DataClientDriver } from '../client/driver.js';

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type CreateTableRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export type UpdateTableRequest = ConnectionRequest & {
  updates: Record<string, RepositoryUpdates>;
  repository: PgTableRepository;
};

export type DeleteTableRequest = ConnectionRequest & {
  tables: string[];
};

export type RepositoryUpdates = {
  name: string;
  schema: {
    toCreate: Record<string, AnySchema>;
    toUpdate: Record<string, AnySchema>;
    toRemove: Record<string, AnySchema>;
    toRename: Record<string, string>;
  };
  relations: {
    toCreate: PgRelationRepository;
    toRemove: PgRelationRepository;
  };
  indexes: {
    toCreate: PgIndexRepository;
    toRemove: PgIndexRepository;
  };
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

  const tableQueries = [];
  const relationsQueries = [];
  const indexesQueries = [];

  for (const table in repository) {
    const { name, schema, indexes, relations } = repository[table];

    indexesQueries.push(...prepareCreateIndexes(name, schema, indexes, false));
    relationsQueries.push(...prepareCreateRelations(name, relations));
    tableQueries.push(prepareCreateTable(name, schema, indexes));
  }

  const createStatements = [...tableQueries, ...indexesQueries, ...relationsQueries].map((query) => ({ query }));

  await driver.executeTransaction(createStatements);
};

export const updateTables = async (request: UpdateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository, updates } = request;

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const indexQueries = [];
  const otherQueries = [];

  for (const table in updates) {
    const { schema: schemaUpdates, indexes: indexesUpdates, relations: relationUpdates, name } = updates[table];
    const { schema: tableSchema, indexes: tableIndexes } = repository[table];

    indexQueries.push(...prepareUpdateIndexes(name, tableSchema, indexesUpdates.toCreate, indexesUpdates.toRemove, true));

    otherQueries.push(
      ...prepareCreateColumns(name, tableIndexes, schemaUpdates.toCreate),
      ...prepareCreateRelations(name, relationUpdates.toCreate),
      ...prepareUpdateColumns(name, tableIndexes, schemaUpdates.toUpdate),
      ...prepareRenameColumns(name, schemaUpdates.toRename),
      ...prepareDeleteRelations(name, relationUpdates.toRemove),
      ...prepareDeleteColumns(name, schemaUpdates.toRemove)
    );
  }

  const otherStatements = otherQueries.map((query) => ({ query }));
  const indexStatements = indexQueries.map((query) => ({ query }));

  await driver.executeTransaction(otherStatements);
  await driver.executeStatements(indexStatements);
};

export const deleteTables = async (request: DeleteTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, tables } = request;

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const driver = new DataClientDriver({
    resourceArn: clusterArn,
    secretArn,
    database
  });

  const deleteStatements = tables.map((table) => ({
    query: prepareDeleteTable(table)
  }));

  await driver.executeTransaction(deleteStatements);
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
