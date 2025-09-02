import type { Database, Client as DbClient, ParametersModeUtils, TransactionModeUtils } from '@ez4/database';
import type { InternalTableMetadata, Repository } from './types';

import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { executeStatement, executeTransaction } from './common/client';
import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries';
import { MissingRepositoryTableError, UnsupportedNamedParametersError, UnsupportedTransactionError } from './errors';
import { Table } from './table';

type TableType = Table<InternalTableMetadata>;

const client = DynamoDBDocumentClient.from(new DynamoDBClient(), {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

export type ClientContext = {
  repository: Repository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service>(context: ClientContext): DbClient<T> => {
    const { repository, debug } = context;

    const tableCache: Record<string, TableType> = {};

    const clientInstance = new (class {
      async rawQuery(query: string, parameters: ParametersModeUtils.Type<T> = []) {
        if (!Array.isArray(parameters)) {
          throw new UnsupportedNamedParametersError();
        }

        const command = { ConsistentRead: true, Parameters: parameters, Statement: query };

        const { records } = await executeStatement(client, command, debug);

        return records;
      }

      async transaction<O extends TransactionModeUtils.Type<T, void>>(operation: O) {
        if (!isStaticTransaction<T>(operation)) {
          throw new UnsupportedTransactionError();
        }

        const commands = await prepareStaticTransaction<T>(repository, operation);

        await executeTransaction(client, commands, debug);
      }
    })();

    return new Proxy<any>(clientInstance, {
      get: (target, property) => {
        if (property in target) {
          return Reflect.get(target, property);
        }

        const tableAlias = property.toString();

        if (!repository[tableAlias]) {
          return undefined;
        }

        if (tableCache[tableAlias]) {
          return tableCache[tableAlias];
        }

        const { name, schema, indexes } = repository[tableAlias];

        const table = new Table(name, schema, indexes, {
          client,
          debug
        });

        tableCache[tableAlias] = table;

        return table;
      }
    });
  };
}

const isStaticTransaction = <T extends Database.Service>(operation: unknown): operation is TransactionModeUtils.StaticOperationType<T> => {
  return !(operation instanceof Function);
};

const prepareStaticTransaction = async <T extends Database.Service>(
  repository: Repository,
  operations: TransactionModeUtils.StaticOperationType<T>
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
