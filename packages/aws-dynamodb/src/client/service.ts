import type { Database, Client as DbClient, Transaction, RelationMetadata } from '@ez4/database';
import type { Repository } from './types.js';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { executeStatement, executeTransaction } from './common/client.js';
import { Table } from './table.js';

type TableType = Table<Database.Schema, Database.Indexes<Database.Schema>, RelationMetadata>;

const client = DynamoDBDocumentClient.from(new DynamoDBClient(), {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

const tableCache: Record<string, TableType> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(
    repository: Repository,
    debug?: boolean
  ): DbClient<T> => {
    const instance = new (class {
      async rawQuery(query: string, values: unknown[]) {
        const command = { ConsistentRead: true, Parameters: values, Statement: query };

        const result = await executeStatement(client, command, debug);

        return result.Items ?? [];
      }

      async transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void> {
        const commands = await prepareTransactions(repository, operations);

        await executeTransaction(client, commands, debug);
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

        const table = new Table(name, schema, indexes, {
          client,
          debug
        });

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

    if (!operationTable) {
      continue;
    }

    const { name, schema } = repository[alias];

    for (const query of operationTable) {
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
