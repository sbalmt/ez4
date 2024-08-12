import type { Database, Client as DbClient, ClientTables } from '@ez4/database';
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
    const tableCache: Record<string, Table> = {};

    return new (class {
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

      table = new Proxy({} as ClientTables<T>, {
        get: (_target, property) => {
          const tableAlias = property.toString();

          let tableService = tableCache[tableAlias];

          if (!tableService) {
            if (!(tableAlias in tableRepository)) {
              throw new Error(`Table ${tableAlias} isn't part of the given table repository.`);
            }

            const { tableName, tableSchema } = tableRepository[tableAlias];

            tableService = new Table(tableName, tableSchema, client);

            tableCache[tableAlias] = tableService;
          }

          return tableService;
        }
      });
    })();
  };
}
