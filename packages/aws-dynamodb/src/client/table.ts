import type { Database, Query, Table as DbTable } from '@ez4/database';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { ObjectSchema } from '@ez4/schema';

import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { getJsonChanges } from '@ez4/aws-dynamodb/runtime';

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

  async findFirst<U extends Query.SelectInput<T>>(
    input: Query.FindFirstInput<T, U>
  ): Promise<Query.FindFirstResult<T, U>> {
    const result = await this.findMany({
      select: input.select,
      where: input.where,
      limit: 1
    });

    return result.records[0];
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
