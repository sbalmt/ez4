import type { Database, Query, RelationMetadata, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { deepClone } from '@ez4/utils';

import { executeStatement, executeTransaction } from './common/client.js';

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

export class Table<
  T extends Database.Schema,
  I extends Database.Indexes<T>,
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
    const command = await prepareInsertOne(this.name, this.schema, query);

    const { client, debug } = this.settings;

    await executeStatement(client, command, debug);
  }

  async updateOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateOneInput<T, S, I, R>
  ): Promise<Query.UpdateOneResult<T, S, R>> {
    const command = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const { client, debug } = this.settings;

      const { Items } = await executeStatement(client, command, debug);

      const result = Items?.at(0) as Query.UpdateOneResult<T, S, R> | undefined;

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
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindOne(this.name, secondaryIndexes, query);

    const { client, debug } = this.settings;

    const { Items } = await executeStatement(client, command, debug);

    const result = Items?.at(0) as Query.UpdateOneResult<T, S, R> | undefined;

    if (result) {
      return deepClone<any, any, any>(result, { include: query.select });
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I, R>
  ): Promise<Query.DeleteOneResult<T, S, R>> {
    const command = prepareDeleteOne(this.name, query);

    const { client, debug } = this.settings;

    const { Items } = await executeStatement(client, command, debug);

    const result = Items?.at(0) as Query.UpdateOneResult<T, S, R> | undefined;

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
    const [primaryIndexes] = this.indexes;

    const transactions = await prepareInsertMany(this.name, this.schema, primaryIndexes, query);

    const { client, debug } = this.settings;

    await executeTransaction(client, transactions, debug);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S, R>
  ): Promise<Query.UpdateManyResult<T, S, R>> {
    const [primaryIndexes] = this.indexes;

    const { client, debug } = this.settings;

    const [transactions, records] = await prepareUpdateMany(
      this.name,
      this.schema,
      client,
      primaryIndexes,
      query,
      debug
    );

    await executeTransaction(client, transactions, debug);

    return records;
  }

  async findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I, R>
  ): Promise<Query.FindManyResult<T, S, R>> {
    const [, ...secondaryIndexes] = this.indexes;

    const command = prepareFindMany(this.name, secondaryIndexes, query);

    const { client, debug } = this.settings;

    const { Items = [], NextToken } = await executeStatement(client, command, debug);

    return {
      records: Items as Query.Record<T, S, R>[],
      cursor: NextToken
    };
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S, R>
  ): Promise<Query.DeleteManyResult<T, S, R>> {
    const [primaryIndexes] = this.indexes;

    const { client, debug } = this.settings;

    const [transactions, records] = await prepareDeleteMany(
      this.name,
      client,
      primaryIndexes,
      query,
      debug
    );

    await executeTransaction(client, transactions, debug);

    return records;
  }
}
