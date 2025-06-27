import type { Arn } from '@ez4/aws-common';
import type { AnySchema } from '@ez4/schema';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { Logger } from '@ez4/aws-common';

import { callWithRetryOnResume } from '../utils/retry.js';
import { executeStatement, executeStatements, executeTransaction } from '../client/common/client.js';
import { prepareCreateColumns, prepareUpdateColumns, prepareDeleteColumns, prepareRenameColumns } from './common/columns.js';
import { prepareCreateRelations, prepareDeleteRelations } from './common/relations.js';
import { prepareCreateDatabase, prepareDeleteDatabase } from './common/database.js';
import { prepareCreateIndexes, prepareUpdateIndexes } from './common/indexes.js';
import { prepareCreateTable, prepareDeleteTable } from './common/table.js';
import { MigrationServiceName } from './types.js';

const client = new RDSDataClient({});

export type ConnectionRequest = {
  database: string;
  clusterArn: Arn;
  secretArn: Arn;
};

export type CreateTableRequest = ConnectionRequest & {
  repository: Repository;
};

export type UpdateTableRequest = ConnectionRequest & {
  updates: Record<string, RepositoryUpdates>;
  repository: Repository;
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
    toCreate: RepositoryRelations;
    toRemove: RepositoryRelations;
  };
  indexes: {
    toCreate: RepositoryIndexes;
    toRemove: RepositoryIndexes;
  };
};

export const createDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logCreate(MigrationServiceName, `${database} database`);

  const connection = {
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  };

  const createCommand = {
    sql: prepareCreateDatabase(database)
  };

  await callWithRetryOnResume(async () => {
    await executeStatement(client, connection, createCommand);
  });
};

export const createTables = async (request: CreateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository } = request;

  Logger.logCreate(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

  const tableQueries = [];
  const relationsQueries = [];
  const indexesQueries = [];

  for (const table in repository) {
    const { name, schema, indexes, relations } = repository[table];

    indexesQueries.push(...prepareCreateIndexes(name, schema, indexes, false));
    relationsQueries.push(...prepareCreateRelations(name, relations));
    tableQueries.push(prepareCreateTable(name, schema, indexes));
  }

  const createCommands = [...tableQueries, ...indexesQueries, ...relationsQueries].map((sql) => ({ sql }));

  await callWithRetryOnResume(async () => {
    await executeTransaction(client, connection, createCommands);
  });
};

export const updateTables = async (request: UpdateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository, updates } = request;

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

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

  const otherCommands = otherQueries.map((sql) => ({ sql }));
  const indexCommands = indexQueries.map((sql) => ({ sql }));

  await callWithRetryOnResume(async () => {
    await executeTransaction(client, connection, otherCommands);
    await executeStatements(client, connection, indexCommands);
  });
};

export const deleteTables = async (request: DeleteTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, tables } = request;

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

  const deleteCommands = tables.map((table) => ({
    sql: prepareDeleteTable(table)
  }));

  await callWithRetryOnResume(async () => {
    await executeTransaction(client, connection, deleteCommands);
  });
};

export const deleteDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logDelete(MigrationServiceName, `${database} database`);

  const connection = {
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  };

  const deleteCommand = {
    sql: prepareDeleteDatabase(database)
  };

  await callWithRetryOnResume(async () => {
    await executeStatement(client, connection, deleteCommand);
  });
};
