import type { Database, Relations, Client as DbClient, Transaction } from '@ez4/database';
import type { Repository } from './types.js';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { executeStatement, executeTransaction } from './common/client.js';
import { Table } from './table.js';

type TableType = Table<Database.Schema, Database.Indexes<Database.Schema>, Relations>;

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

const tableCache: Record<string, TableType> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(repository: Repository): DbClient<T> => {
    const instance = new (class {
      async rawQuery(query: string, values: unknown[]) {
        const result = await executeStatement(client, {
          ConsistentRead: true,
          Statement: query,
          Parameters: values
        });

        return result.Items ?? [];
      }

      async transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void> {
        const commands = await prepareTransactions(repository, operations);

        await executeTransaction(client, commands);
      }
    })();

    return new Proxy<any>(instance, {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        }

        const alias = property.toString();

        if (tableCache[alias]) {
          return tableCache[alias];
        }

        if (!repository[alias]) {
          throw new Error(`Table ${alias} isn't part of the repository.`);
        }

        const { name, schema, indexes } = repository[alias];

        const table = new Table(name, schema, indexes, client);

        tableCache[alias] = table;

        return table;
      }
    });
  };
}

const prepareTransactions = async <
  T extends Database.Service<any>,
  U extends Transaction.WriteOperations<T>
>(
  repository: Repository,
  operations: U
) => {
  const commands = [];

  for (const alias in operations) {
    const operationTable = operations[alias];

    if (!repository[alias]) {
      throw new Error(`Table ${alias} isn't part of the repository.`);
    }

    const { name, schema } = repository[alias];

    for (const operationName in operationTable) {
      const query = operationTable[operationName];

      if ('insert' in query) {
        commands.push(await prepareInsertOne(name, schema, query.insert));
      } else if ('update' in query) {
        commands.push(await prepareUpdateOne(name, schema, query.update));
      } else if ('delete' in query) {
        commands.push(prepareDeleteOne(name, query.delete));
      }
    }
  }

  return commands;
};
