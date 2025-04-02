import type { Database, Client as DbClient, RelationMetadata, Transaction } from '@ez4/database';
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

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { detectFieldData } from './common/data.js';
import { getTableName } from '../utils/tables.js';
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

    const dbClientInstance = new (class {
      rawQuery(query: string, values: unknown[] = []) {
        const { transactionId, debug } = context;

        const command = {
          parameters: values.map((value, index) => detectFieldData(`${index}`, value)),
          sql: query
        };

        return executeStatement(client, connection, command, transactionId, debug);
      }

      async transaction<O extends Transaction.Operation<T, R>, R>(operation: O) {
        if (operation instanceof Function) {
          return executeInteractiveTransaction(connection, repository, context, operation);
        }

        await executeStaticTransaction(connection, repository, context, operation);
      }
    })();

    return new Proxy<any>(dbClientInstance, {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        }

        const tableAlias = property.toString();

        if (tableCache[tableAlias]) {
          return tableCache[tableAlias];
        }

        if (!repository[tableAlias]) {
          throw new Error(`Table ${tableAlias} isn't part of the repository.`);
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

  for (const alias in relations) {
    const relation = relations[alias]!;

    const sourceAlias = relation.sourceAlias;

    const sourceRepository = repository[sourceAlias];

    if (!sourceRepository) {
      throw new Error(`Table ${sourceAlias} isn't part of the repository.`);
    }

    relationsWithSchema[alias] = {
      sourceSchema: sourceRepository.schema,
      sourceTable: getTableName(sourceAlias),
      ...relation
    };
  }

  return relationsWithSchema;
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

const executeStaticTransaction = async <T extends Database.Service, U extends Transaction.WriteOperation<T>>(
  connection: Connection,
  repository: Repository,
  context: ClientContext,
  operations: U
) => {
  const { transactionId, debug } = context;

  const commands = await prepareStaticTransaction(repository, operations);

  if (transactionId) {
    await executeStatements(client, connection, commands, transactionId, debug);
  } else {
    await executeTransaction(client, connection, commands, debug);
  }
};

const prepareStaticTransaction = async <T extends Database.Service, U extends Transaction.WriteOperation<T>>(
  repository: Repository,
  operations: U
) => {
  const commands = [];

  for (const tableAlias in operations) {
    const operationTable = operations[tableAlias];

    if (!repository[tableAlias]) {
      throw new Error(`Table ${tableAlias} isn't part of the repository.`);
    }

    if (!operationTable) {
      continue;
    }

    const { name, schema, relations } = repository[tableAlias];

    const relationsWithSchema = getRelationsWithSchema(repository, relations);

    for (const query of operationTable) {
      if ('insert' in query) {
        commands.push(await prepareInsertOne(name, schema, relationsWithSchema, query.insert));
      } else if ('update' in query) {
        commands.push(await prepareUpdateOne(name, schema, relationsWithSchema, query.update));
      } else if ('delete' in query) {
        commands.push(prepareDeleteOne(name, schema, relationsWithSchema, query.delete));
      }
    }
  }

  return commands;
};
