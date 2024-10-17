import type { Database, Query, Table as DbTable } from '@ez4/database';
import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { PreparedQueryCommand } from './utils/query.js';
import type { Configuration } from './types.js';

import { SchemaTypeName } from '@ez4/schema';

import { batchTransaction, executeStatement } from './utils/client.js';

import {
  prepareDeleteMany,
  prepareDeleteOne,
  prepareFindMany,
  prepareFindOne,
  prepareInsertMany,
  prepareInsertOne,
  prepareUpdateMany,
  prepareUpdateOne
} from './utils/query.js';

export class Table<T extends Database.Schema = Database.Schema, I extends string | never = never>
  implements DbTable<T, I>
{
  constructor(
    private configuration: Configuration,
    private name: string,
    private schema: ObjectSchema,
    private client: RDSDataClient
  ) {}

  private parseRecord<T extends Record<string, unknown>>(record: T): T {
    const result: any = {};

    for (const name in record) {
      const schema = this.schema.properties[name];
      const value = record[name];

      if (schema.type === SchemaTypeName.Object && typeof value === 'string') {
        result[name] = JSON.parse(value);
      } else {
        result[name] = value;
      }
    }

    return result;
  }

  private async sendQueryCommand(input: PreparedQueryCommand | PreparedQueryCommand[]) {
    if (input instanceof Array) {
      return batchTransaction(this.configuration, this.client, input);
    }

    return executeStatement(this.configuration, this.client, input);
  }

  async insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult> {
    const command = await prepareInsertOne(this.name, this.schema, query);

    await this.sendQueryCommand(command);
  }

  async updateOne<S extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, S, I>
  ): Promise<Query.UpdateOneResult<T, S>> {
    const { select, where } = query;

    const updateCommand = prepareUpdateOne(this.name, this.schema, query);

    if (!select) {
      await this.sendQueryCommand(updateCommand);

      return undefined;
    }

    const selectCommand = prepareFindOne(this.name, this.schema, {
      select,
      where
    });

    const [[record]] = await this.sendQueryCommand([selectCommand, updateCommand]);

    return this.parseRecord(record);
  }

  async findOne<S extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S>> {
    const command = prepareFindOne(this.name, this.schema, query);
    const [record] = await this.sendQueryCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S>> {
    const command = prepareDeleteOne(this.name, this.schema, query);
    const [record] = await this.sendQueryCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async upsertOne<S extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, S, I>
  ): Promise<Query.UpsertOneResult<T, S>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as S),
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

  async insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult> {
    const commands = await prepareInsertMany(this.name, this.schema, query);

    await this.sendQueryCommand(commands);
  }

  async updateMany<S extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S>> {
    const { select, where, limit } = query;

    const updateCommand = prepareUpdateMany(this.name, this.schema, query);

    if (!select) {
      await this.sendQueryCommand(updateCommand);

      return [];
    }

    const selectCommand = prepareFindMany(this.name, this.schema, {
      select,
      where,
      limit
    });

    const [records] = await this.sendQueryCommand([selectCommand, updateCommand]);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }

  async findMany<S extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, S>
  ): Promise<Query.FindManyResult<T, S>> {
    const command = prepareFindMany(this.name, this.schema, query);
    const records = await this.sendQueryCommand(command);

    return {
      records: records.map((record: AnyObject) => this.parseRecord(record)),
      ...(query.cursor && {
        cursor: Number(query.cursor) + records.length
      })
    };
  }

  async deleteMany<S extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S>> {
    const command = prepareDeleteMany(this.name, this.schema, query);
    const records = await this.sendQueryCommand(command);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }
}
