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
        const statements = [];

        for (const name in operations) {
          const operationTable = operations[name];

          if (!repository[name]) {
            throw new Error(`Table ${name} isn't part of the table repository.`);
          }

          const { tableName, tableSchema } = repository[name];

          for (const operationName in operationTable) {
            const query = operationTable[operationName];

            if ('insert' in query) {
              statements.push(await prepareInsertOne(tableName, tableSchema, query.insert));
            } else if ('update' in query) {
              statements.push(await prepareUpdateOne(tableName, tableSchema, query.update));
            } else if ('delete' in query) {
              statements.push(prepareDeleteOne(tableName, query.delete));
            }
          }
        }

        await executeTransaction(client, statements);
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

        const { tableName, tableSchema, tableIndexes } = repository[alias];

        const table = new Table(tableName, tableSchema, tableIndexes, client);

        tableCache[alias] = table;

        return table;
      }
    });
  };
}
