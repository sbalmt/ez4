import type { Database, Query, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { getJsonChanges } from '@ez4/aws-dynamodb/runtime';
import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';

import { prepareInsert, prepareUpdate, prepareSelect, prepareDelete } from './query.js';

export class Table<T extends Database.Schema = Database.Schema> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
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

  async findOne<U extends Query.SelectInput<T>>(
    input: Query.FindOneInput<T, U>
  ): Promise<Query.FindOneResult<T, U>> {
    const result = await this.findMany({
      select: input.select,
      where: input.where,
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

  async updateMany<U extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, U>
  ): Promise<Query.UpdateManyResult<T, U>> {
    const [statement, variables] = prepareUpdate(this.name, query);

    const { cursor, limit } = query;

    const result = await this.client.send(
      new ExecuteStatementCommand({
        NextToken: cursor?.toString(),
        Statement: statement,
        Limit: limit,
        ...(variables.length && {
          Parameters: variables
        })
      })
    );

    return (result.Items ?? []) as Query.Record<T, U>[];
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
    const [statement, variables] = prepareDelete(this.name, query);

    const { cursor, limit } = query;

    const result = await this.client.send(
      new ExecuteStatementCommand({
        NextToken: cursor?.toString(),
        Statement: statement,
        Limit: limit,
        ...(variables.length && {
          Parameters: variables
        })
      })
    );

    return (result.Items ?? []) as Query.Record<T, U>[];
  }
}
