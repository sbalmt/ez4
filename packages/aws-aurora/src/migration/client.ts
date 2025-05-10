import type { Arn } from '@ez4/aws-common';
import type { AnySchema } from '@ez4/schema';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { Logger } from '@ez4/aws-common';

import { PreparedQueryCommand } from '../client/common/queries.js';
import { executeStatement, executeTransaction } from '../client/common/client.js';
import { prepareCreateDatabase, prepareDeleteDatabase } from './common/database.js';
import { prepareCreateColumns, prepareUpdateColumns, prepareDeleteColumns, prepareRenameColumns } from './common/columns.js';
import { prepareCreateRelations, prepareDeleteRelations } from './common/relations.js';
import { prepareCreateIndexes, prepareDeleteIndexes } from './common/indexes.js';
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

    tablesCommands.push({ sql: prepareCreateTable(name, schema, indexes) });
    indexesCommands.push(...prepareCreateIndexes(name, schema, indexes).map((sql) => ({ sql })));
    relationsCommands.push(...prepareCreateRelations(name, relations).map((sql) => ({ sql })));
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

  const commands: PreparedQueryCommand[] = [];

  for (const table in updates) {
    const { schema: schemaUpdates, indexes: indexesUpdates, relations: relationUpdates, name } = updates[table];
    const { schema: tableSchema, indexes: tableIndexes } = repository[table];

    const createColumns = prepareCreateColumns(name, tableIndexes, schemaUpdates.toCreate);
    const createIndexes = prepareCreateIndexes(name, tableSchema, indexesUpdates.toCreate);
    const createRelations = prepareCreateRelations(name, relationUpdates.toCreate);

    const updateColumns = prepareUpdateColumns(name, tableIndexes, schemaUpdates.toUpdate);
    const renameColumns = prepareRenameColumns(name, schemaUpdates.toRename);

    const removeRelations = prepareDeleteRelations(name, relationUpdates.toRemove);
    const removeIndexes = prepareDeleteIndexes(name, indexesUpdates.toRemove);
    const removeColumns = prepareDeleteColumns(name, schemaUpdates.toRemove);

    commands.push(
      ...[
        ...createColumns,
        ...createIndexes,
        ...createRelations,
        ...updateColumns,
        ...renameColumns,
        ...removeRelations,
        ...removeIndexes,
        ...removeColumns
      ].map((sql) => ({ sql }))
    );
  }

  await executeTransaction(client, connection, commands);
};

export const deleteTables = async (request: DeleteTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, tables } = request;

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const connection = {
    resourceArn: clusterArn,
    secretArn,
    database
  };

  const commands = tables.map((table) => {
    return { sql: prepareDeleteTable(table) };
  });

  await executeTransaction(client, connection, commands);
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
