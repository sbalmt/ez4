import type { Database, Query, RelationMetadata, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { deepClone } from '@ez4/utils';

import { executeStatement, executeTransaction } from './common/client.js';

import {
  prepareInsertOne,
  prepareInsertMany,
  prepareFindOne,
  prepareFindMany,
  prepareUpdateOne,
  prepareUpdateMany,
  prepareDeleteMany,
  prepareDeleteOne,
  prepareCount
} from './common/queries.js';

export class Table<
  T extends Database.Schema,
  I extends Database.Indexes,
  R extends RelationMetadata
> implements DbTable<T, I, R>
{
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[][],
    private settings: {
      client: DynamoDBDocumentClient;
      debug?: boolean;
    }
  ) {}

  async insertOne(query: Query.InsertOneInput<T, R>): Promise<Query.InsertOneResult> {
    const { client, debug } = this.settings;

    const command = await prepareInsertOne(this.name, this.schema, query);

    await executeStatement(client, command, debug);
  }

  async updateOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateOneInput<T, S, I, R>
  ): Promise<Query.UpdateOneResult<T, S, R>> {
    const command = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const { client, debug } = this.settings;

      const { Items: items = [] } = await executeStatement(client, command, debug);

      const result = items[0] as Query.UpdateOneResult<T, S, R> | undefined;

      if (query.select && result) {
        return deepClone<any, any, any>(result, { include: query.select });
      }

      return result;
    } catch (e) {
      if (!(e instanceof ConditionalCheckFailedException)) {
        throw e;
      }

      return undefined;
    }
  }

  async findOne<S extends Query.SelectInput<T, R>>(
    query: Query.FindOneInput<T, S, I, R>
  ): Promise<Query.FindOneResult<T, S, R>> {
    const { client, debug } = this.settings;

    const command = prepareFindOne(this.name, this.indexes, query);

    const { Items: items = [] } = await executeStatement(client, command, debug);

    const result = items[0] as Query.UpdateOneResult<T, S, R> | undefined;

    if (result) {
      return deepClone<any, any, any>(result, { include: query.select });
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I, R>
  ): Promise<Query.DeleteOneResult<T, S, R>> {
    const { client, debug } = this.settings;

    const command = prepareDeleteOne(this.name, query);

    const { Items: items = [] } = await executeStatement(client, command, debug);

    const result = items[0] as Query.UpdateOneResult<T, S, R> | undefined;

    if (query.select && result) {
      return deepClone<any, any, any>(result, { include: query.select });
    }

    return result;
  }

  async upsertOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpsertOneInput<T, S, I, R>
  ): Promise<Query.UpsertOneResult<T, S, R>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<T, S, R>),
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
      where: query.where as Query.WhereInput<T, {}, R>,
      data: query.update,
      limit: 1
    });

    return previous;
  }

  async insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult> {
    const { client, debug } = this.settings;

    const transactions = await prepareInsertMany(this.name, this.schema, this.indexes, query);

    await executeTransaction(client, transactions, debug);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S, R>
  ): Promise<Query.UpdateManyResult<T, S, R>> {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareUpdateMany(
      this.name,
      this.schema,
      this.indexes,
      client,
      query,
      debug
    );

    await executeTransaction(client, transactions, debug);

    return records;
  }

  async findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I, R>
  ): Promise<Query.FindManyResult<T, S, R>> {
    const { client, debug } = this.settings;

    const command = prepareFindMany(this.name, this.indexes, query);

    const { Items: items = [], NextToken: cursor } = await executeStatement(client, command, debug);

    return {
      records: items as Query.Record<T, S, R>[],
      cursor
    };
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S, R>
  ): Promise<Query.DeleteManyResult<T, S, R>> {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareDeleteMany(
      this.name,
      this.indexes,
      client,
      query,
      debug
    );

    await executeTransaction(client, transactions, debug);

    return records;
  }

  async count(query: Query.CountInput<T, R>): Promise<number> {
    const { client, debug } = this.settings;

    const command = prepareCount(this.name, this.indexes, query);

    const { Items: items = [] } = await executeStatement(client, command, debug);

    return items.length;
  }
}
