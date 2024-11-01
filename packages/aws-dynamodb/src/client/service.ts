import type { Database, Client as DbClient, Transaction } from '@ez4/database';
import type { Repository } from './types.js';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { executeTransactions, executeStatement } from './common/client.js';
import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { Table } from './table.js';

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

const tableCache: Record<string, Table> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(
    repository: Record<string, Repository>
  ): DbClient<T> => {
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
        const transactions = [];

        for (const name in operations) {
          const operationTable = operations[name];

          if (!(name in repository)) {
            throw new Error(`Table ${name} isn't part of the table repository.`);
          }

          const { tableName, tableSchema } = repository[name];

          for (const operationName in operationTable) {
            const query = operationTable[operationName];

            if ('insert' in query) {
              transactions.push(await prepareInsertOne(tableName, tableSchema, query.insert));
            } else if ('update' in query) {
              transactions.push(await prepareUpdateOne(tableName, tableSchema, query.update));
            } else if ('delete' in query) {
              transactions.push(prepareDeleteOne(tableName, query.delete));
            }
          }
        }

        await executeTransactions(client, transactions);
      }
    })();

    return new Proxy<any>(instance, {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        }

        const name = property.toString();

        if (!tableCache[name]) {
          if (!(name in repository)) {
            throw new Error(`Table ${name} isn't part of the table repository.`);
          }

          const { tableName, tableSchema, tableIndexes } = repository[name];

          tableCache[name] = new Table(tableName, tableSchema, tableIndexes, client);
        }

        return tableCache[name];
      }
    });
  };
}
