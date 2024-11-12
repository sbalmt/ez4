import type { Arn } from '@ez4/aws-common';
import type { AnySchema } from '@ez4/schema';
import type { Repository, RepositoryIndexes, RepositoryRelations } from '../types/repository.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { Logger } from '@ez4/aws-common';

import { PreparedQueryCommand } from '../client/common/queries.js';
import { executeStatement, executeTransaction } from '../client/common/client.js';
import { prepareCreateDatabase, prepareDeleteDatabase } from './common/database.js';
import { prepareCreateTable, prepareDeleteTable, prepareUpdateTable } from './common/table.js';
import { prepareCreateRelations, prepareUpdateRelations } from './common/relations.js';
import { prepareCreateIndexes, prepareUpdateIndexes } from './common/indexes.js';
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
  repository: Record<string, RepositoryUpdates>;
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

    tablesCommands.push({
      sql: prepareCreateTable(name, schema)
    });

    relationsCommands.push(
      ...prepareCreateRelations(name, relations).map((sql) => {
        return { sql };
      })
    );

    indexesCommands.push(
      ...prepareCreateIndexes(name, indexes).map((sql) => {
        return { sql };
      })
    );
  }

  await executeTransaction(client, connection, [
    ...tablesCommands,
    ...indexesCommands,
    ...relationsCommands
  ]);
};

export const updateTables = async (request: UpdateTableRequest): Promise<void> => {
  const { clusterArn, secretArn, database, repository } = request;

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

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

    tablesCommands.push(
      ...prepareUpdateTable(name, schema.toCreate, schema.toUpdate, schema.toRemove).map((sql) => {
        return { sql };
      })
    );

    relationsCommands.push(
      ...prepareUpdateRelations(name, relations.toCreate, relations.toRemove).map((sql) => {
        return { sql };
      })
    );

    indexesCommands.push(
      ...prepareUpdateIndexes(name, indexes.toCreate, indexes.toRemove).map((sql) => {
        return { sql };
      })
    );
  }

  await executeTransaction(client, connection, [
    ...tablesCommands,
    ...indexesCommands,
    ...relationsCommands
  ]);
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
