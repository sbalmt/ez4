import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { Table as DbTable, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { InternalTableMetadata } from './types';

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

import { getTransformedRecords } from '../client';
import { executeStatement, executeTransaction } from './common/client';
import { isDuplicateItemError } from './utils/errors';

import {
  prepareInsertOne,
  prepareInsertMany,
  prepareFindOne,
  prepareFindMany,
  prepareUpdateOne,
  prepareUpdateMany,
  prepareDeleteMany,
  prepareDeleteOne,
  prepareExists,
  prepareCount
} from './common/queries';

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

    if (query.data) {
      const [firstResult] = getTransformedRecords([query.data], this.schema, query.select);

      return firstResult as Query.InsertOneResult<S, T>;
    }

    return undefined as Query.InsertOneResult<S, T>;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const { records } = await executeStatement(client, statement, debug);

      const [firstRecord] = getTransformedRecords(records, this.schema, query.select);

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

    const statement = prepareFindOne(this.name, this.schema, this.indexes, query);

    const { records } = await executeStatement(client, statement, debug);

    const [firstRecord] = getTransformedRecords(records, this.schema, query.select);

    return firstRecord;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const { client, debug } = this.settings;

    const statement = prepareDeleteOne(this.name, this.schema, query);

    const { records } = await executeStatement(client, statement, debug);

    const [firstRecord] = getTransformedRecords(records, this.schema, query.select);

    return firstRecord;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<S, T>),
      where: query.where
    });

    if (!previous) {
      try {
        await this.insertOne({ data: query.insert });

        if (query.select) {
          const [firstRecord] = getTransformedRecords([query.insert], this.schema, query.select);

          return { record: firstRecord, inserted: true } as Query.UpsertOneResult<S, T>;
        }

        return { inserted: true } as Query.UpsertOneResult<S, T>;
      } catch (error) {
        // In case of race condition, fallback to update.
        if (!isDuplicateItemError(error)) {
          throw error;
        }
      }
    }

    const firstRecord = await this.updateOne({
      where: query.where as Query.WhereInput<T>,
      select: query.select,
      data: query.update
    });

    return { record: firstRecord, inserted: false } as Query.UpsertOneResult<S, T>;
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

    if (records) {
      return getTransformedRecords(records, this.schema, query.select) as Query.UpdateManyResult<S, T>;
    }

    return undefined as Query.UpdateManyResult<S, T>;
  }

  async findMany<S extends Query.SelectInput<T>, C extends boolean = false>(query: Query.FindManyInput<S, C, T>) {
    const { client, debug } = this.settings;

    const { count: shouldCount } = query;

    const findStatement = prepareFindMany(this.name, this.schema, this.indexes, query);
    const findOperation = executeStatement(client, findStatement, debug);

    const allOperations = [findOperation];

    if (shouldCount) {
      const countStatement = prepareCount(this.name, this.schema, this.indexes, { where: query.where });
      const countOperation = executeStatement(client, countStatement, debug);

      allOperations.push(countOperation);
    }

    const results = await Promise.all(allOperations);

    const [{ records, cursor }, countResult] = results;

    return {
      ...(shouldCount && { total: countResult?.records.length }),
      records: getTransformedRecords(records, this.schema, query.select),
      cursor
    } as unknown as Query.FindManyResult<S, C, T>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareDeleteMany(this.name, this.schema, this.indexes, client, query, debug);

    await executeTransaction(client, transactions, debug);

    if (records) {
      return getTransformedRecords(records, this.schema, query.select) as Query.DeleteManyResult<S, T>;
    }

    return undefined as Query.DeleteManyResult<S, T>;
  }

  async exists(query: Query.ExistsInput<T>) {
    const { client, debug } = this.settings;

    const statement = prepareExists(this.name, this.schema, this.indexes, query);

    const { records } = await executeStatement(client, statement, debug);

    const [firstRecord] = records;

    return !!firstRecord;
  }

  async count(query: Query.CountInput<T>) {
    const { client, debug } = this.settings;

    const statement = prepareCount(this.name, this.schema, this.indexes, query);

    const { records } = await executeStatement(client, statement, debug);

    return records.length;
  }
}
