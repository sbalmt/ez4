import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Table as DbTable, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { InternalTableMetadata } from './types.js';

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

export type TableSettings = {
  client: DynamoDBDocumentClient;
  debug?: boolean;
};

export class Table<T extends InternalTableMetadata> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[][],
    private settings: TableSettings
  ) {}

  async insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = await prepareInsertOne(this.name, this.schema, query);

    await executeStatement(client, statement, debug);

    if (query.select) {
      return deepClone<any, any, any>(query.data, { include: query.select }) as Query.InsertOneResult<S, T>;
    }

    return undefined as Query.InsertOneResult<S, T>;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const { records } = await executeStatement(client, statement, debug);

      const [firstRecord] = records;

      if (query.select && firstRecord) {
        return deepClone<any, any, any>(firstRecord, {
          include: query.select
        });
      }

      return firstRecord;
    } catch (e) {
      if (!(e instanceof ConditionalCheckFailedException)) {
        throw e;
      }

      return undefined;
    }
  }

  async findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = prepareFindOne(this.name, this.indexes, query);

    const { records } = await executeStatement(client, statement, debug);

    const [firstRecord] = records;

    if (firstRecord) {
      return deepClone<any, any, any>(firstRecord, { include: query.select }) as Query.FindOneResult<S, T>;
    }

    return undefined as Query.FindOneResult<S, T>;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = prepareDeleteOne(this.name, query);

    const { records } = await executeStatement(client, statement, debug);

    const [firstRecord] = records;

    if (query.select && firstRecord) {
      return deepClone<any, any, any>(firstRecord, {
        include: query.select
      });
    }

    return firstRecord;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<S, T>),
      where: query.where
    });

    if (!previous) {
      await this.insertOne({ data: query.insert });

      if (query.select) {
        return deepClone<any, any, any>(query.insert, { include: query.select }) as Query.UpsertOneResult<S, T>;
      }

      return undefined as Query.UpsertOneResult<S, T>;
    }

    await this.updateMany({
      where: query.where as Query.WhereInput<T>,
      data: query.update,
      limit: 1
    });

    return previous as Query.UpsertOneResult<S, T>;
  }

  async insertMany(query: Query.InsertManyInput<T>) {
    const { client, debug } = this.settings;

    const transactions = await prepareInsertMany(this.name, this.schema, this.indexes, query);

    await executeTransaction(client, transactions, debug);
  }

  async updateMany<S extends Query.SelectInput<T>>(query: Query.UpdateManyInput<S, T>) {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareUpdateMany(this.name, this.schema, this.indexes, client, query, debug);

    await executeTransaction(client, transactions, debug);

    return records as Query.UpdateManyResult<S, T>;
  }

  async findMany<S extends Query.SelectInput<T>, C extends boolean = false>(query: Query.FindManyInput<S, C, T>) {
    const { client, debug } = this.settings;

    const { count: shouldCount } = query;

    const findStatement = prepareFindMany(this.name, this.indexes, query);
    const findOperation = executeStatement(client, findStatement, debug);

    const allOperations = [findOperation];

    if (shouldCount) {
      const countStatement = prepareCount(this.name, this.indexes, { where: query.where });
      const countOperation = executeStatement(client, countStatement, debug);

      allOperations.push(countOperation);
    }

    const results = await Promise.all(allOperations);

    const [{ records, cursor }, countResult] = results;

    return {
      ...(shouldCount && { total: countResult?.records.length }),
      records,
      cursor
    } as unknown as Query.FindManyResult<S, C, T>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareDeleteMany(this.name, this.indexes, client, query, debug);

    await executeTransaction(client, transactions, debug);

    return records as Query.DeleteManyResult<S, T>;
  }

  async count(query: Query.CountInput<T>) {
    const { client, debug } = this.settings;

    const statement = prepareCount(this.name, this.indexes, query);

    const { records } = await executeStatement(client, statement, debug);

    return records.length;
  }
}
