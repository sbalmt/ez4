import type { Database, Client as DbClient, Parameters, RelationMetadata, Transaction } from '@ez4/database';
import type { Repository, RepositoryRelations, RepositoryRelationsWithSchema } from '../types/repository.js';
import type { Connection } from './types.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';

import {
  executeStatement,
  executeStatements,
  executeTransaction,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
} from './common/client.js';

import { getTableName } from '../utils/tables.js';
import { detectFieldData } from './common/data.js';
import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { MissingRepositoryTableError } from './errors.js';
import { Table } from './table.js';

type TableType = Table<Database.Schema, Database.Indexes, RelationMetadata>;

const client = new RDSDataClient();

export type ClientContext = {
  transactionId?: string;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service>(
    connection: Connection,
    repository: Repository,
    context: ClientContext = {}
  ): DbClient<T> => {
    const tableCache: Record<string, TableType> = {};

    const clientInstance = new (class {
      rawQuery(query: string, parameters: Parameters.Type<T> = []) {
        const { transactionId, debug } = context;

        const command = {
          parameters: getParameters(parameters),
          sql: query
        };

        return executeStatement(client, connection, command, transactionId, debug);
      }

      async transaction<O extends Transaction.Type<T, R>, R>(operation: O) {
        if (!isStaticTransaction<T>(operation)) {
          return executeInteractiveTransaction(connection, repository, context, operation);
        }

        await executeStaticTransaction<T>(connection, repository, context, operation);
      }
    })();

    return new Proxy<any>(clientInstance, {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        }

        const tableAlias = property.toString();

        if (tableCache[tableAlias]) {
          return tableCache[tableAlias];
        }

        if (!repository[tableAlias]) {
          throw new MissingRepositoryTableError(tableAlias);
        }

        const { name, schema, relations } = repository[tableAlias];

        const relationsWithSchema = getRelationsWithSchema(repository, relations);

        const table = new Table(name, schema, relationsWithSchema, {
          ...context,
          connection,
          client
        });

        tableCache[tableAlias] = table;

        return table;
      }
    });
  };
}

const getRelationsWithSchema = (repository: Repository, relations: RepositoryRelations) => {
  const relationsWithSchema: RepositoryRelationsWithSchema = {};

  for (const tableAlias in relations) {
    const tableRelation = relations[tableAlias];

    if (!tableRelation) {
      throw new MissingRepositoryTableError(tableAlias);
    }

    const sourceAlias = tableRelation.sourceAlias;
    const sourceRepository = repository[sourceAlias];

    if (!sourceRepository) {
      throw new MissingRepositoryTableError(sourceAlias);
    }

    relationsWithSchema[tableAlias] = {
      sourceSchema: sourceRepository.schema,
      sourceTable: getTableName(sourceAlias),
      ...tableRelation
    };
  }

  return relationsWithSchema;
};

const isStaticTransaction = <T extends Database.Service>(operation: unknown): operation is Transaction.StaticOperationType<T> => {
  return !(operation instanceof Function);
};

const executeInteractiveTransaction = async (
  connection: Connection,
  repository: Repository,
  context: ClientContext,
  operation: Function
) => {
  if (context.transactionId) {
    const instance = Client.make(connection, repository, context);

    return operation(instance);
  }

  const transactionId = await beginTransaction(client, connection);

  try {
    const instance = Client.make(connection, repository, {
      ...context,
      transactionId
    });

    const result = await operation(instance);

    await commitTransaction(client, connection, transactionId);

    return result;
  } catch (error) {
    await rollbackTransaction(client, connection, transactionId);

    throw error;
  }
};

const getParameters = <T extends Database.Service>(parameters: Parameters.Type<T>) => {
  if (Array.isArray(parameters)) {
    return getParametersFromList(parameters);
  }

  return getParametersFromMap(parameters);
};

const getParametersFromList = (parameters: unknown[]) => {
  return parameters.map((value, index) => {
    const field = index.toString();

    return detectFieldData(field, value);
  });
};

const getParametersFromMap = (parameters: Record<string, unknown>) => {
  const parameterList = [];

  for (const field in parameters) {
    const value = parameters[field];

    if (value !== undefined) {
      parameterList.push(detectFieldData(field, value));
    }
  }

  return parameterList;
};

const executeStaticTransaction = async <T extends Database.Service>(
  connection: Connection,
  repository: Repository,
  context: ClientContext,
  operations: Transaction.StaticOperationType<T>
) => {
  const { transactionId, debug } = context;

  const commands = await prepareStaticTransaction<T>(repository, operations);

  if (transactionId) {
    await executeStatements(client, connection, commands, transactionId, debug);
  } else {
    await executeTransaction(client, connection, commands, debug);
  }
};

const prepareStaticTransaction = async <T extends Database.Service>(
  repository: Repository,
  operations: Transaction.StaticOperationType<T>
) => {
  const commands = [];

  for (const tableAlias in operations) {
    const repositoryTable = repository[tableAlias];
    const operationTable = operations[tableAlias];

    if (!operationTable) {
      continue;
    }

    if (!repositoryTable) {
      throw new MissingRepositoryTableError(tableAlias);
    }

    const { name, schema, relations } = repositoryTable;

    const relationsWithSchema = getRelationsWithSchema(repository, relations);

    for (const query of operationTable) {
      if (!query) {
        continue;
      }

      if ('insert' in query) {
        commands.push(await prepareInsertOne(name, schema, relationsWithSchema, query.insert));
        continue;
      }

      if ('update' in query) {
        commands.push(await prepareUpdateOne(name, schema, relationsWithSchema, query.update));
        continue;
      }

      if ('delete' in query) {
        commands.push(prepareDeleteOne(name, schema, relationsWithSchema, query.delete));
      }
    }
  }

  return commands;
};
