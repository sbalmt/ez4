import type { Table as DbTable, Query, TableMetadata } from '@ez4/database';
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

export type TableSettings = {
  client: DynamoDBDocumentClient;
  debug?: boolean;
};

export class Table<T extends TableMetadata> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private indexes: string[][],
    private settings: TableSettings
  ) {}

  async insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>) {
    const { client, debug } = this.settings;

    const command = await prepareInsertOne(this.name, this.schema, query);

    await executeStatement(client, command, debug);

    if (query.select) {
      return deepClone<any, any, any>(query.data, {
        include: query.select
      });
    }

    return undefined;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const { client, debug } = this.settings;

    const command = await prepareUpdateOne(this.name, this.schema, query);

    try {
      const { Items: [result] = [] } = await executeStatement(client, command, debug);

      if (query.select && result) {
        return deepClone<any, any, any>(result, {
          include: query.select
        });
      }

      return result;
    } catch (e) {
      if (!(e instanceof ConditionalCheckFailedException)) {
        throw e;
      }

      return undefined;
    }
  }

  async findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>) {
    const { client, debug } = this.settings;

    const command = prepareFindOne(this.name, this.indexes, query);

    const { Items: [result] = [] } = await executeStatement(client, command, debug);

    if (result) {
      return deepClone<any, any, any>(result, {
        include: query.select
      });
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const { client, debug } = this.settings;

    const command = prepareDeleteOne(this.name, query);

    const { Items: [result] = [] } = await executeStatement(client, command, debug);

    if (query.select && result) {
      return deepClone<any, any, any>(result, {
        include: query.select
      });
    }

    return result;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<S, T>),
      where: query.where
    });

    if (!previous) {
      await this.insertOne({
        data: query.insert
      });

      if (query.select) {
        return deepClone<any, any, any>(query.insert, {
          include: query.select
        });
      }

      return undefined;
    }

    await this.updateMany({
      select: query.select,
      where: query.where as Query.WhereInput<T>,
      data: query.update,
      limit: 1
    });

    return previous;
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

  async findMany<S extends Query.SelectInput<T>, C extends boolean = false>(query: Query.FindManyInput<S, T, C>) {
    const { client, debug } = this.settings;

    const { count: shouldCount } = query;

    const findCommand = prepareFindMany(this.name, this.indexes, query);

    const findOperation = executeStatement(client, findCommand, debug);

    const allOperations = [findOperation];

    if (shouldCount) {
      const countCommand = prepareCount(this.name, this.indexes, {
        where: query.where
      });

      const countOperation = executeStatement(client, countCommand, debug);

      allOperations.push(countOperation);
    }

    const results = await Promise.all(allOperations);

    const [{ Items: items = [], NextToken: cursor }, total] = results;

    return {
      ...(shouldCount && { total: total?.Items?.length }),
      records: items,
      cursor
    } as unknown as Query.FindManyResult<S, T, C>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const { client, debug } = this.settings;

    const [transactions, records] = await prepareDeleteMany(this.name, this.indexes, client, query, debug);

    await executeTransaction(client, transactions, debug);

    return records as Query.DeleteManyResult<S, T>;
  }

  async count(query: Query.CountInput<T>) {
    const { client, debug } = this.settings;

    const command = prepareCount(this.name, this.indexes, query);

    const { Items: items = [] } = await executeStatement(client, command, debug);

    return items.length;
  }
}
