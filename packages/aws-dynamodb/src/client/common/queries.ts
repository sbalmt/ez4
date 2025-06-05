import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Query, TableMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { validateSchema } from '@ez4/aws-dynamodb/runtime';

import { preparePartialSchema } from './schema.js';
import { findBestSecondaryIndex } from './indexes.js';
import { executeStatement } from './client.js';
import { prepareInsert } from './insert.js';
import { prepareUpdate } from './update.js';
import { prepareSelect } from './select.js';
import { prepareDelete } from './delete.js';

export const prepareInsertOne = async <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<S, T>
): Promise<ExecuteStatementCommandInput> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsert(table, schema, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareFindOne = <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  indexes: string[][],
  query: Query.FindOneInput<S, T>
): ExecuteStatementCommandInput => {
  const [, ...secondaryIndexes] = indexes;

  const secondaryIndex = findBestSecondaryIndex(secondaryIndexes, query.where);

  const [statement, variables] = prepareSelect(table, secondaryIndex, query);

  return {
    ConsistentRead: !secondaryIndex,
    Statement: statement,
    Limit: 1,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateOne = async <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<S, T>
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

export const prepareDeleteOne = <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  query: Query.DeleteOneInput<S, T>
): ExecuteStatementCommandInput => {
  const [statement, variables] = prepareDelete(table, query);

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareInsertMany = async <T extends TableMetadata>(
  table: string,
  schema: ObjectSchema,
  indexes: string[][],
  query: Query.InsertManyInput<T>
): Promise<ExecuteStatementCommandInput[]> => {
  const [[partitionKey, sortKey]] = indexes;

  const identifiers = new Set<string>();

  const transactions = [];

  for (const data of query.data) {
    const { [partitionKey]: partitionId, [sortKey]: sortId } = data as any;

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

export const prepareFindMany = <T extends TableMetadata, S extends Query.SelectInput<T>, C extends boolean>(
  table: string,
  indexes: string[][],
  query: Query.FindManyInput<S, T, C>
): ExecuteStatementCommandInput => {
  const [, ...secondaryIndexes] = indexes;

  const secondaryIndex = findBestSecondaryIndex(secondaryIndexes, query.order ?? query.where ?? {});

  const [statement, variables] = prepareSelect(table, secondaryIndex, query);

  return {
    Statement: statement,
    ConsistentRead: !secondaryIndex,
    ...('cursor' in query && {
      NextToken: query.cursor
    }),
    ...('limit' in query && {
      Limit: query.limit
    }),
    ...(variables.length && {
      Parameters: variables
    })
  };
};

export const prepareUpdateMany = async <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  indexes: string[][],
  client: DynamoDBDocumentClient,
  query: Query.UpdateManyInput<S, T>,
  debug?: boolean
): Promise<[ExecuteStatementCommandInput[], Query.UpdateManyResult<S, T>]> => {
  const [[partitionKey, sortKey]] = indexes;

  const command = prepareFindMany(table, indexes, {
    ...query,
    select: {
      ...query.select,
      ...(sortKey && { [sortKey]: true }),
      [partitionKey]: true
    } as Query.StrictSelectInput<S, T>
  });

  const { records } = await executeStatement(client, command, debug);

  if (!records?.length) {
    return [[], [] as unknown as Query.UpdateManyResult<S, T>];
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
        } as Query.WhereInput<T>
      });

      return {
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      };
    })
  );

  return [transactions, records as Query.UpdateManyResult<S, T>];
};

export const prepareDeleteMany = async <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  indexes: string[][],
  client: DynamoDBDocumentClient,
  query: Query.DeleteManyInput<S, T>,
  debug?: boolean
): Promise<[ExecuteStatementCommandInput[], Query.DeleteManyResult<S, T>]> => {
  const [[partitionKey, sortKey]] = indexes;

  const command = prepareFindMany(table, indexes, {
    ...query,
    select: {
      ...query.select,
      ...(sortKey && { [sortKey]: true }),
      [partitionKey]: true
    } as Query.StrictSelectInput<S, T>
  });

  const { records } = await executeStatement(client, command, debug);

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
      } as Query.WhereInput<T>
    });

    transactions.push({
      Statement: statement,
      ...(variables.length && {
        Parameters: variables
      })
    });
  }

  return [transactions, records as Query.DeleteManyResult<S, T>];
};

export const prepareCount = <T extends TableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  indexes: string[][],
  query: Query.CountInput<T>
): ExecuteStatementCommandInput => {
  const [[partitionKey], ...secondaryIndexes] = indexes;

  const secondaryIndex = findBestSecondaryIndex(secondaryIndexes, query.where ?? {});

  const [statement, variables] = prepareSelect(table, secondaryIndex, {
    where: query.where,
    select: {
      [partitionKey]: true
    } as Query.StrictSelectInput<S, T>
  });

  return {
    Statement: statement,
    ...(variables.length && {
      Parameters: variables
    })
  };
};
