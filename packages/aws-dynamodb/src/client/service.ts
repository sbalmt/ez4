import type { Database, Client as DbClient, ParametersUtils, TransactionUtils, TableMetadata } from '@ez4/database';
import type { Repository } from './types.js';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { executeStatement, executeTransaction } from './common/client.js';
import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { MissingRepositoryTableError, UnsupportedNamedParametersError, UnsupportedTransactionError } from './errors.js';
import { Table } from './table.js';

type TableType = Table<TableMetadata>;

const client = DynamoDBDocumentClient.from(new DynamoDBClient(), {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

export type ClientSettings = {
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service>(repository: Repository, settings?: ClientSettings): DbClient<T> => {
    const tableCache: Record<string, TableType> = {};

    const debugMode = settings?.debug;

    const clientInstance = new (class {
      async rawQuery(query: string, parameters: ParametersUtils.Type<T> = []) {
        if (!Array.isArray(parameters)) {
          throw new UnsupportedNamedParametersError();
        }

        const command = { ConsistentRead: true, Parameters: parameters, Statement: query };

        const { records } = await executeStatement(client, command, debugMode);

        return records;
      }

      async transaction<O extends TransactionUtils.Type<T, void>>(operation: O) {
        if (!isStaticTransaction<T>(operation)) {
          throw new UnsupportedTransactionError();
        }

        const commands = await prepareStaticTransaction<T>(repository, operation);

        await executeTransaction(client, commands, debugMode);
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

        const { name, schema, indexes } = repository[tableAlias];

        const table = new Table(name, schema, indexes, {
          ...settings,
          client
        });

        tableCache[tableAlias] = table;

        return table;
      }
    });
  };
}

const isStaticTransaction = <T extends Database.Service>(operation: unknown): operation is TransactionUtils.StaticOperationType<T> => {
  return !(operation instanceof Function);
};

const prepareStaticTransaction = async <T extends Database.Service>(
  repository: Repository,
  operations: TransactionUtils.StaticOperationType<T>
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

    const { name, schema } = repositoryTable;

    for (const query of operationTable) {
      if (!query) {
        continue;
      }

      if ('insert' in query) {
        commands.push(await prepareInsertOne(name, schema, query.insert));
        continue;
      }

      if ('update' in query) {
        commands.push(await prepareUpdateOne(name, schema, query.update as any));
        continue;
      }

      if ('delete' in query) {
        commands.push(prepareDeleteOne(name, query.delete));
      }
    }
  }

  return commands;
};
