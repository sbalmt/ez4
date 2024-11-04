import type { Database, Query, Table as DbTable } from '@ez4/database';
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

export class Table<T extends Database.Schema = Database.Schema> implements DbTable<T, never> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[][],
    private client: DynamoDBDocumentClient
  ) {}

  async insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult> {
    const command = await prepareInsertOne(this.name, this.schema, query);

    await executeStatement(this.client, command);
  }

  async updateOne<S extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, S, never>
  ): Promise<Query.UpdateOneResult<T, S>> {
    const command = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const result = await executeStatement(this.client, command);

      return result.Items?.at(0) as Query.UpdateOneResult<T, S>;
    } catch (e) {
      if (!(e instanceof ConditionalCheckFailedException)) {
        throw e;
      }

      return undefined;
    }
  }

  async findOne<S extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, S, never>
  ): Promise<Query.FindOneResult<T, S>> {
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindOne(this.name, secondaryIndexes, query);

    const result = await executeStatement(this.client, command);

    return result.Items?.at(0) as Query.FindOneResult<T, S>;
  }

  async deleteOne<S extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, S, never>
  ): Promise<Query.DeleteOneResult<T, S>> {
    const command = prepareDeleteOne(this.name, query);

    const result = await executeStatement(this.client, command);

    return result.Items?.at(0) as Query.DeleteOneResult<T, S>;
  }

  async upsertOne<S extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, S, never>
  ): Promise<Query.UpsertOneResult<T, S>> {
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

    const transactions = await prepareInsertMany(this.name, this.schema, primaryIndexes, query);

    await executeTransactions(this.client, transactions);
  }

  async updateMany<S extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S>> {
    const [primaryIndexes] = this.indexes;

    const [transactions, records] = await prepareUpdateMany(
      this.name,
      this.schema,
      this.client,
      primaryIndexes,
      query
    );

    await executeTransactions(this.client, transactions);

    return records;
  }

  async findMany<S extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, S, never>
  ): Promise<Query.FindManyResult<T, S>> {
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindMany(this.name, secondaryIndexes, query);

    const result = await executeStatement(this.client, command);

    return {
      records: (result.Items ?? []) as Query.Record<T, S>[],
      cursor: result.NextToken
    };
  }

  async deleteMany<S extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S>> {
    const [primaryIndexes] = this.indexes;

    const [transactions, records] = await prepareDeleteMany(
      this.name,
      this.client,
      primaryIndexes,
      query
    );

    await executeTransactions(this.client, transactions);

    return records;
  }
}
