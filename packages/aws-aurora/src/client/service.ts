import type { Database, Client as DbClient, RelationMetadata, Transaction } from '@ez4/database';
import type { Connection } from './types.js';

import type {
  Repository,
  RepositoryRelations,
  RepositoryRelationsWithSchema
} from '../types/repository.js';

import { RDSDataClient } from '@aws-sdk/client-rds-data';

import { getTableName } from '../utils/tables.js';
import { prepareDeleteOne, prepareInsertOne, prepareUpdateOne } from './common/queries.js';
import { executeStatement, executeTransaction } from './common/client.js';
import { detectFieldData } from './common/data.js';
import { Table } from './table.js';

type TableType = Table<Database.Schema, Database.Indexes<Database.Schema>, RelationMetadata>;

const client = new RDSDataClient();

const tableCache: Record<string, TableType> = {};

export namespace Client {
  export const make = <T extends Database.Service<any>>(
    connection: Connection,
    repository: Repository,
    debug?: boolean
  ): DbClient<T> => {
    const instance = new (class {
      rawQuery(query: string, values: unknown[]) {
        const parameters = values.map((value, index) => detectFieldData(`${index}`, value));

        return executeStatement(client, connection, { parameters, sql: query }, undefined, debug);
      }

      async transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void> {
        const commands = await prepareTransactions(repository, operations);

        await executeTransaction(client, connection, commands, debug);
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

        const { name, schema, relations } = repository[alias];

        const relationsWithSchema = getRelationsWithSchema(repository, relations);

        const table = new Table(name, schema, relationsWithSchema, {
          client,
          connection,
          debug
        });

        tableCache[alias] = table;

        return table;
      }
    });
  };
}

const getRelationsWithSchema = (repository: Repository, relations: RepositoryRelations) => {
  const relationsWithSchema: RepositoryRelationsWithSchema = {};

  for (const alias in relations) {
    const relation = relations[alias]!;

    const { sourceAlias } = relation;

    const sourceRepository = repository[sourceAlias];

    if (!sourceRepository) {
      throw new Error(`Table ${sourceAlias} isn't part of the repository.`);
    }

    relationsWithSchema[alias] = {
      sourceSchema: sourceRepository.schema,
      sourceTable: getTableName(sourceAlias),
      ...relation
    };
  }

  return relationsWithSchema;
};

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

    const { name, schema, relations } = repository[alias];

    const relationsWithSchema = getRelationsWithSchema(repository, relations);

    for (const operationName in operationTable) {
      const query = operationTable[operationName];

      if ('insert' in query) {
        commands.push(await prepareInsertOne(name, schema, relationsWithSchema, query.insert));
      } else if ('update' in query) {
        commands.push(await prepareUpdateOne(name, schema, relationsWithSchema, query.update));
      } else if ('delete' in query) {
        commands.push(prepareDeleteOne(name, schema, relationsWithSchema, query.delete));
      }
    }
  }

  return commands;
};
