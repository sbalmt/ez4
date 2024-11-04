import type { Database, Client as DbClient, Transaction } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Configuration, Repository } from './types.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { executeStatement, executeTransaction } from './common/client.js';
import { Table } from './table.js';

const client = new RDSDataClient();

const tableCache: Record<string, Table> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(
    configuration: Configuration,
    repository: Record<string, Repository>
  ): DbClient<T> => {
    const instance = new (class {
      rawQuery(query: string, values: SqlParameter[]) {
        return executeStatement(configuration, client, {
          sql: query,
          parameters: values
        });
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
              transactions.push(prepareUpdateOne(tableName, tableSchema, query.update));
            } else if ('delete' in query) {
              transactions.push(prepareDeleteOne(tableName, tableSchema, query.delete));
            }
          }
        }

        await executeTransaction(configuration, client, transactions);
      }
    })();

    return new Proxy<any>(instance, {
      get: (target, property) => {
        if (property in target) {
          return target[property];
        }

        const name = property.toString();

        if (tableCache[name]) {
          return tableCache[name];
        }

        if (!(name in repository)) {
          throw new Error(`Table ${name} isn't part of the table repository.`);
        }

        const { tableName, tableSchema } = repository[name];

        const table = new Table(configuration, tableName, tableSchema, client);

        tableCache[name] = table;

        return table;
      }
    });
  };
}
