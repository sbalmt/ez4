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

export class Table<T extends Database.Schema = Database.Schema> implements DbTable<T> {
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

  async updateOne<U extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, U>
  ): Promise<Query.UpdateOneResult<T, U>> {
    const result = await this.updateMany({
      select: query.select,
      where: query.where,
      data: query.data,
      limit: 1
    });

    return result[0];
  }

  async findOne<U extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, U>
  ): Promise<Query.FindOneResult<T, U>> {
    const result = await this.findMany({
      select: query.select,
      where: query.where,
      limit: 1
    });

    return result.records[0];
  }

  async upsertOne<U extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, U>
  ): Promise<Query.UpsertOneResult<T, U>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as U),
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

  async deleteOne<U extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, U>
  ): Promise<Query.DeleteOneResult<T, U>> {
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

    return result.Items?.at(0) as Query.DeleteOneResult<T, U>;
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

  async updateMany<U extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, U>
  ): Promise<Query.UpdateManyResult<T, U>> {
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

      const [statement, variables] = prepareUpdate(this.name, {
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

  async findMany<U extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, U>
  ): Promise<Query.FindManyResult<T, U>> {
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
      records: (result.Items ?? []) as Query.Record<T, U>[],
      cursor: result.NextToken
    };
  }

  async deleteMany<U extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, U>
  ): Promise<Query.DeleteManyResult<T, U>> {
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
