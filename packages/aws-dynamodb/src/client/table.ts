import type { Database, Query, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { getJsonChanges } from '@ez4/aws-dynamodb/runtime';
import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';

import { batchTransactions } from './utils/transaction.js';
import { prepareInsert } from './query/insert.js';
import { prepareUpdate } from './query/update.js';
import { prepareSelect } from './query/select.js';
import { prepareDelete } from './query/delete.js';

export class Table<T extends Database.Schema = Database.Schema, I extends string | never = never>
  implements DbTable<T, I>
{
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[],
    private client: DynamoDBDocumentClient
  ) {}

  async insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult> {
    await getJsonChanges(query.data, this.schema);

    const [statement, variables] = prepareInsert(this.name, query);

    await this.client.send(
      new ExecuteStatementCommand({
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      })
    );
  }

  async updateOne<S extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, S, I>
  ): Promise<Query.UpdateOneResult<T, S>> {
    const result = await this.updateMany({
      select: query.select,
      where: query.where,
      data: query.data,
      limit: 1
    });

    return result[0];
  }

  async findOne<S extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S>> {
    const result = await this.findMany({
      select: query.select,
      where: query.where,
      limit: 1
    });

    return result.records[0];
  }

  async upsertOne<S extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, S, I>
  ): Promise<Query.UpsertOneResult<T, S>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as S),
      where: query.where
    });

    if (!previous) {
      await this.insertOne({
        data: query.insert
      });
    } else {
      await this.updateMany({
        select: query.select,
        where: query.where,
        data: query.update,
        limit: 1
      });
    }

    return previous;
  }

  async deleteOne<S extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S>> {
    const [statement, variables] = prepareDelete(this.name, query);

    const result = await this.client.send(
      new ExecuteStatementCommand({
        Statement: statement,
        Limit: 1,
        ...(variables.length && {
          Parameters: variables
        })
      })
    );

    return result.Items?.at(0) as Query.DeleteOneResult<T, S>;
  }

  async insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult> {
    const [partitionKey, sortKey] = this.indexes;

    const identifiers = new Set<string>();
    const transactions = [];

    for (const data of query.data as any) {
      const { [partitionKey]: partitionId, [sortKey]: sortId } = data;

      const uniqueId = `${partitionId}${sortId ?? ''}`;

      if (identifiers.has(uniqueId)) {
        continue;
      }

      identifiers.add(uniqueId);

      const [statement, variables] = prepareInsert(this.name, {
        data
      });

      transactions.push({
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      });
    }

    await batchTransactions(this.client, transactions);
  }

  async updateMany<S extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S>> {
    const [partitionKey, sortKey] = this.indexes;

    const result = await this.findMany({
      ...query,
      select: {
        ...query.select,
        ...(sortKey && { [sortKey]: true }),
        [partitionKey]: true
      }
    });

    const records = result.records as any[];

    if (!records.length) {
      return [];
    }

    const transactions = [];

    for (const record of records) {
      const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

      const [statement, variables] = prepareUpdate(this.name, this.schema, {
        data: query.data,
        where: {
          ...(sortKey && { [sortKey]: sortId }),
          [partitionKey]: partitionId
        } as T
      });

      transactions.push({
        Statement: statement,
        ...(variables.length && {
          Parameters: variables
        })
      });
    }

    await batchTransactions(this.client, transactions);

    return records;
  }

  async findMany<S extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, S>
  ): Promise<Query.FindManyResult<T, S>> {
    const [statement, variables] = prepareSelect(this.name, query);

    const { cursor, limit } = query;

    const result = await this.client.send(
      new ExecuteStatementCommand({
        ConsistentRead: true,
        NextToken: cursor?.toString(),
        Statement: statement,
        Limit: limit,
        ...(variables.length && {
          Parameters: variables
        })
      })
    );

    return {
      records: (result.Items ?? []) as Query.Record<T, S>[],
      cursor: result.NextToken
    };
  }

  async deleteMany<S extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S>> {
    const [partitionKey, sortKey] = this.indexes;

    const result = await this.findMany({
      ...query,
      select: {
        ...query.select,
        ...(sortKey && { [sortKey]: true }),
        [partitionKey]: true
      }
    });

    const records = result.records as any[];

    if (!records.length) {
      return [];
    }

    const transactions = [];

    for (const record of records) {
      const { [partitionKey]: partitionId, [sortKey]: sortId } = record;

      const [statement, variables] = prepareDelete(this.name, {
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

    await batchTransactions(this.client, transactions);

    return records;
  }
}
