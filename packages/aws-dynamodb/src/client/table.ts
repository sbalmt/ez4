import type { Database, Relations, Query, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

import { executeStatement, executeTransactions } from './common/client.js';

import {
  prepareDeleteMany,
  prepareDeleteOne,
  prepareFindMany,
  prepareFindOne,
  prepareInsertMany,
  prepareInsertOne,
  prepareUpdateMany,
  prepareUpdateOne
} from './common/queries.js';

export class Table<T extends Database.Schema, I extends Database.Indexes<T>, R extends Relations>
  implements DbTable<T, I, R>
{
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[][],
    private client: DynamoDBDocumentClient
  ) {}

  async insertOne(query: Query.InsertOneInput<T, I, R>): Promise<Query.InsertOneResult> {
    const command = await prepareInsertOne<T, I, R>(this.name, this.schema, query);

    await executeStatement(this.client, command);
  }

  async updateOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateOneInput<T, S, I, R>
  ): Promise<Query.UpdateOneResult<T, S, R>> {
    const command = await prepareUpdateOne<T, I, R, S>(this.name, this.schema, query);

    try {
      const result = await executeStatement(this.client, command);

      return result.Items?.at(0) as Query.UpdateOneResult<T, S, R>;
    } catch (e) {
      if (!(e instanceof ConditionalCheckFailedException)) {
        throw e;
      }

      return undefined;
    }
  }

  async findOne<S extends Query.SelectInput<T, R>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S, R>> {
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindOne<T, I, R, S>(this.name, secondaryIndexes, query);

    const result = await executeStatement(this.client, command);

    return result.Items?.at(0) as Query.FindOneResult<T, S, R>;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S, R>> {
    const command = prepareDeleteOne<T, I, R, S>(this.name, query);

    const result = await executeStatement(this.client, command);

    return result.Items?.at(0) as Query.DeleteOneResult<T, S, R>;
  }

  async upsertOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpsertOneInput<T, S, I>
  ): Promise<Query.UpsertOneResult<T, S, R>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as S),
      where: query.where
    });

    if (!previous) {
      await this.insertOne({
        data: query.insert
      });

      return previous;
    }

    await this.updateMany({
      select: query.select,
      where: query.where,
      data: query.update,
      limit: 1
    });

    return previous;
  }

  async insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult> {
    const [primaryIndexes] = this.indexes;

    const transactions = await prepareInsertMany<T, I, R>(
      this.name,
      this.schema,
      primaryIndexes,
      query
    );

    await executeTransactions(this.client, transactions);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S, R>> {
    const [primaryIndexes] = this.indexes;

    const [transactions, records] = await prepareUpdateMany<T, I, R, S>(
      this.name,
      this.schema,
      this.client,
      primaryIndexes,
      query
    );

    await executeTransactions(this.client, transactions);

    return records;
  }

  async findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I>
  ): Promise<Query.FindManyResult<T, S, R>> {
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindMany<T, I, R, S>(this.name, secondaryIndexes, query);

    const result = await executeStatement(this.client, command);

    return {
      records: (result.Items ?? []) as Query.Record<T, S, R>[],
      cursor: result.NextToken
    };
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S, R>> {
    const [primaryIndexes] = this.indexes;

    const [transactions, records] = await prepareDeleteMany<T, I, R, S>(
      this.name,
      this.client,
      primaryIndexes,
      query
    );

    await executeTransactions(this.client, transactions);

    return records;
  }
}
