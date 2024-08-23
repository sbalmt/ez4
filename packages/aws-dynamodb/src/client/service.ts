import type { Database, Client as DbClient } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { DynamoDBDocumentClient, ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Table } from './table.js';

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

export namespace Client {
  export type Repository = {
    tableName: string;
    tableSchema: ObjectSchema;
  };

  export const make = <T extends Database.Service>(
    tableRepository: Record<string, Repository>
  ): DbClient<T> => {
    const cache: Record<string, Table> = {};

    const instance = new (class {
      async rawQuery(query: string, values: unknown[]) {
        const result = await client.send(
          new ExecuteStatementCommand({
            ConsistentRead: true,
            Statement: query,
            Parameters: values
          })
        );

        return result.Items ?? [];
      }
    })();

    return new Proxy(instance as DbClient<T>, {
      get: (_target, property) => {
        const tableAlias = property.toString();

        if (!cache[tableAlias]) {
          if (!(tableAlias in tableRepository)) {
            throw new Error(`Table ${tableAlias} isn't part of the table repository.`);
          }

          const { tableName, tableSchema } = tableRepository[tableAlias];

          cache[tableAlias] = new Table(tableName, tableSchema, client);
        }

        return cache[tableAlias];
      }
    });
  };
}
