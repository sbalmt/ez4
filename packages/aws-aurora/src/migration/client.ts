import type { Arn } from '@ez4/aws-common';
import type { AnySchema } from '@ez4/schema';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { Logger } from '@ez4/aws-common';

import { PreparedQueryCommand } from '../client/common/queries.js';
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

  await executeStatement(client, connection, {
    sql: prepareCreateDatabase(database)
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

  const tablesCommands: PreparedQueryCommand[] = [];
  const relationsCommands: PreparedQueryCommand[] = [];
  const indexesCommands: PreparedQueryCommand[] = [];

  for (const table in repository) {
    const { name, schema, indexes, relations } = repository[table];

    indexesCommands.push(...prepareCreateIndexes(name, schema, indexes, false).map((sql) => ({ sql })));
    relationsCommands.push(...prepareCreateRelations(name, relations).map((sql) => ({ sql })));
    tablesCommands.push({ sql: prepareCreateTable(name, schema, indexes) });
  }

  await executeTransaction(client, connection, [...tablesCommands, ...indexesCommands, ...relationsCommands]);
};

export const updateTables = async (request: UpdateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository, updates } = request;

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

  const indexCommands = [];
  const otherCommands = [];

  for (const table in updates) {
    const { schema: schemaUpdates, indexes: indexesUpdates, relations: relationUpdates, name } = updates[table];

    const { schema: tableSchema, indexes: tableIndexes } = repository[table];

    indexCommands.push(...prepareUpdateIndexes(name, tableSchema, indexesUpdates.toCreate, indexesUpdates.toRemove, true));

    otherCommands.push(
      ...prepareCreateColumns(name, tableIndexes, schemaUpdates.toCreate),
      ...prepareCreateRelations(name, relationUpdates.toCreate),
      ...prepareUpdateColumns(name, tableIndexes, schemaUpdates.toUpdate),
      ...prepareRenameColumns(name, schemaUpdates.toRename),
      ...prepareDeleteRelations(name, relationUpdates.toRemove),
      ...prepareDeleteColumns(name, schemaUpdates.toRemove)
    );
  }

  await executeTransaction(
    client,
    connection,
    otherCommands.map((sql) => ({ sql }))
  );

  await executeStatements(
    client,
    connection,
    indexCommands.map((sql) => ({ sql }))
  );
};

export const deleteTables = async (request: DeleteTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, tables } = request;

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

  await executeTransaction(
    client,
    connection,
    tables.map((table) => ({
      sql: prepareDeleteTable(table)
    }))
  );
};

export const deleteDatabase = async (request: ConnectionRequest): Promise<void> => {
  const { clusterArn, secretArn, database } = request;

  Logger.logDelete(MigrationServiceName, `${database} database`);

  const connection = {
    database: 'postgres',
    resourceArn: clusterArn,
    secretArn
  };

  await executeStatement(client, connection, {
    sql: prepareDeleteDatabase(database)
  });
};
