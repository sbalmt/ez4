import type { Database, Client as DbClient, Relations, Transaction } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { Repository } from '../types/repository.js';
import type { Connection } from './types.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { executeStatement, executeTransaction } from './common/client.js';
import { Table } from './table.js';

type TableType = Table<Database.Schema, Database.Indexes<Database.Schema>, Relations>;

const client = new RDSDataClient();

const tableCache: Record<string, TableType> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(
    connection: Connection,
    repository: Repository
  ): DbClient<T> => {
    const instance = new (class {
      rawQuery(query: string, values: SqlParameter[]) {
        return executeStatement(client, connection, {
          sql: query,
          parameters: values
        });
      }

      async transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void> {
        const statements = [];

        for (const alias in operations) {
          const operationTable = operations[alias];

          if (!(alias in repository)) {
            throw new Error(`Table ${alias} isn't part of the table repository.`);
          }

          const { name, schema, relations } = repository[alias];

          for (const operationName in operationTable) {
            const query = operationTable[operationName];

            if ('insert' in query) {
              statements.push(await prepareInsertOne(name, schema, relations, query.insert));
            } else if ('update' in query) {
              statements.push(await prepareUpdateOne(name, schema, relations, query.update));
            } else if ('delete' in query) {
              statements.push(prepareDeleteOne(name, schema, relations, query.delete));
            }
          }
        }

        await executeTransaction(client, connection, statements);
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

        if (!(alias in repository)) {
          throw new Error(`Table ${alias} isn't part of the repository.`);
        }

        const { name, schema, relations } = repository[alias];

        const table = new Table(client, connection, name, schema, relations);

        tableCache[alias] = table;

        return table;
      }
    });
  };
}
