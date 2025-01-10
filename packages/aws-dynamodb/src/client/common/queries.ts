import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { StrictType } from '@ez4/utils';

import { validateSchema } from '@ez4/aws-dynamodb/runtime';

import { preparePartialSchema } from './schema.js';
import { findBestSecondaryIndex } from './indexes.js';
import { executeStatement } from './client.js';
import { prepareInsert } from './insert.js';
import { prepareUpdate } from './update.js';
import { prepareSelect } from './select.js';
import { prepareDelete } from './delete.js';

export const prepareInsertOne = async <T extends Database.Schema, R extends Relations>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T, R>
): Promise<ExecuteStatementCommandInput> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsert<T, R>(table, schema, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareFindOne = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  indexes: string[][],
  query: Query.FindOneInput<T, S, I, R>
): ExecuteStatementCommandInput => {
  const secondaryIndex = findBestSecondaryIndex(indexes, query.where);

  const [statement, variables] = prepareSelect<T, I, R, S>(table, secondaryIndex, query);

  return {
    ConsistentRead: !secondaryIndex,
    Statement: statement,
    Limit: 1,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateOne = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, I, R>
): Promise<ExecuteStatementCommandInput> => {
  await validateSchema(query.data, preparePartialSchema(schema, query.data));

  const [statement, variables] = prepareUpdate<T, I, R, S>(table, schema, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareDeleteOne = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  query: Query.DeleteOneInput<T, S, I, R>
): ExecuteStatementCommandInput => {
  const [statement, variables] = prepareDelete<T, I, R, S>(table, query);

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

    const uniqueRecordId = `${partitionId}${sortId ?? ''}`;

    if (identifiers.has(uniqueRecordId)) {
      continue;
    }

    identifiers.add(uniqueRecordId);

    await validateSchema(data, schema);

    const [statement, variables] = prepareInsert(table, schema, {
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

export const prepareFindMany = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  indexes: string[][],
  query: Query.FindManyInput<T, S, I, R>
): ExecuteStatementCommandInput => {
  const secondaryIndex = findBestSecondaryIndex(indexes, query.order ?? query.where ?? {});

  const [statement, variables] = prepareSelect<T, I, R, S>(table, secondaryIndex, query);

  const { cursor, limit } = query;

  return {
    ConsistentRead: !secondaryIndex,
    NextToken: cursor?.toString(),
    Statement: statement,
    Limit: limit,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateMany = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  client: DynamoDBDocumentClient,
  indexes: string[],
  query: Query.UpdateManyInput<T, S, R>,
  debug?: boolean
): Promise<[ExecuteStatementCommandInput[], Query.UpdateManyResult<T, S, R>]> => {
  const [partitionKey, sortKey] = indexes;

  const command = prepareFindMany<T, I, R, S>(table, [], {
    ...query,
    select: {
      ...query.select,
      ...(sortKey && { [sortKey]: true }),
      [partitionKey]: true
    } as StrictType<Query.SelectInput<T, R>, S>
  });

  const result = await executeStatement(client, command, debug);

  const records = result.Items;

  if (!records?.length) {
    return [[], []];
  }

  const partialSchema = preparePartialSchema(schema, query.data);

  const transactions = await Promise.all(
    records.map(async (record) => {
      const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

      await validateSchema(query.data, partialSchema);

      const [statement, variables] = prepareUpdate<T, I, R, S>(table, schema, {
        data: query.data,
        where: {
          ...(sortKey && { [sortKey]: sortId }),
          [partitionKey]: partitionId
        } as Query.WhereInput<T, I>
      });

      return {
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      };
    })
  );

  return [transactions, records as Query.UpdateManyResult<T, S, R>];
};

export const prepareDeleteMany = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  client: DynamoDBDocumentClient,
  indexes: string[],
  query: Query.DeleteManyInput<T, S, R>,
  debug?: boolean
): Promise<[ExecuteStatementCommandInput[], Query.DeleteManyResult<T, S, R>]> => {
  const [partitionKey, sortKey] = indexes;

  const command = prepareFindMany<T, I, R, S>(table, [], {
    ...query,
    select: {
      ...query.select,
      ...(sortKey && { [sortKey]: true }),
      [partitionKey]: true
    } as StrictType<Query.SelectInput<T, R>, S>
  });

  const result = await executeStatement(client, command, debug);

  const records = result.Items;

  if (!records?.length) {
    return [[], []];
  }

  const transactions = [];

  for (const record of records) {
    const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

    const [statement, variables] = prepareDelete<T, I, R, S>(table, {
      where: {
        ...(sortKey && { [sortKey]: sortId }),
        [partitionKey]: partitionId
      } as Query.WhereInput<T, I>
    });

    transactions.push({
      Statement: statement,
      ...(variables.length && {
        Parameters: variables
      })
    });
  }

  return [transactions, records as Query.DeleteManyResult<T, S, R>];
};
