import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { validateSchema } from '@ez4/aws-dynamodb/runtime';

import { preparePartialSchema } from './schema.js';
import { executeStatement } from './client.js';

import { prepareInsert } from './insert.js';
import { prepareUpdate } from './update.js';
import { prepareSelect } from './select.js';
import { prepareDelete } from './delete.js';

export const prepareInsertOne = async <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T>
): Promise<ExecuteStatementCommandInput> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsert(table, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareFindOne = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  query: Query.FindOneInput<T, S, never>
): ExecuteStatementCommandInput => {
  const [statement, variables] = prepareSelect(table, query);

  return {
    ConsistentRead: true,
    Statement: statement,
    Limit: 1,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateOne = async <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, never>
): Promise<ExecuteStatementCommandInput> => {
  await validateSchema(query.data, preparePartialSchema(schema, query.data));

  const [statement, variables] = prepareUpdate(table, schema, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareDeleteOne = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  query: Query.DeleteOneInput<T, S, never>
): ExecuteStatementCommandInput => {
  const [statement, variables] = prepareDelete(table, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareInsertMany = async <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  indexes: string[],
  query: Query.InsertManyInput<T>
): Promise<ExecuteStatementCommandInput[]> => {
  const [partitionKey, sortKey] = indexes;

  const identifiers = new Set<string>();

  const transactions = [];

  for (const data of query.data as any) {
    const { [partitionKey]: partitionId, [sortKey]: sortId } = data;

    const uniqueId = `${partitionId}${sortId ?? ''}`;

    if (identifiers.has(uniqueId)) {
      continue;
    }

    identifiers.add(uniqueId);

    await validateSchema(data, schema);

    const [statement, variables] = prepareInsert(table, {
      data
    });

    transactions.push({
      Statement: statement,
      ...(variables.length && {
        Parameters: variables
      })
    });
  }

  return transactions;
};

export const prepareFindMany = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  query: Query.FindManyInput<T, S>
): ExecuteStatementCommandInput => {
  const [statement, variables] = prepareSelect(table, query);

  const { cursor, limit } = query;

  return {
    ConsistentRead: true,
    NextToken: cursor?.toString(),
    Statement: statement,
    Limit: limit,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateMany = async <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  indexes: string[],
  client: DynamoDBDocumentClient,
  query: Query.UpdateManyInput<T, S>
): Promise<[ExecuteStatementCommandInput[], Query.UpdateManyResult<T, S>]> => {
  const [partitionKey, sortKey] = indexes;

  const result = await executeStatement(
    client,
    prepareFindMany(table, {
      ...query,
      select: {
        ...query.select,
        ...(sortKey && { [sortKey]: true }),
        [partitionKey]: true
      }
    })
  );

  const records = result.Items;

  if (!records?.length) {
    return [[], []];
  }

  const partialSchema = preparePartialSchema(schema, query.data);

  const transactions = await Promise.all(
    records.map(async (record) => {
      const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

      await validateSchema(query.data, partialSchema);

      const [statement, variables] = prepareUpdate(table, schema, {
        data: query.data,
        where: {
          ...(sortKey && { [sortKey]: sortId }),
          [partitionKey]: partitionId
        } as T
      });

      return {
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      };
    })
  );

  return [transactions, records as Query.UpdateManyResult<T, S>];
};

export const prepareDeleteMany = async <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  indexes: string[],
  client: DynamoDBDocumentClient,
  query: Query.DeleteManyInput<T, S>
): Promise<[ExecuteStatementCommandInput[], Query.DeleteManyResult<T, S>]> => {
  const [partitionKey, sortKey] = indexes;

  const result = await executeStatement(
    client,
    prepareFindMany(table, {
      ...query,
      select: {
        ...query.select,
        ...(sortKey && { [sortKey]: true }),
        [partitionKey]: true
      }
    })
  );

  const records = result.Items;

  if (!records?.length) {
    return [[], []];
  }

  const transactions = [];

  for (const record of records) {
    const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

    const [statement, variables] = prepareDelete(table, {
      where: {
        ...(sortKey && { [sortKey]: sortId }),
        [partitionKey]: partitionId
      }
    });

    transactions.push({
      Statement: statement,
      ...(variables.length && {
        Parameters: variables
      })
    });
  }

  return [transactions, records as Query.DeleteManyResult<T, S>];
};
