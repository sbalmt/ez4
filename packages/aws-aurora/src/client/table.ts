import type { AnyObject } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { Database, Relations, Query, Table as DbTable } from '@ez4/database';
import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { PreparedQueryCommand } from './common/queries.js';
import type { Connection } from './types.js';

import { SchemaType } from '@ez4/schema';
import { isAnyNumber } from '@ez4/utils';

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

export class Table<T extends Database.Schema, I extends Database.Indexes<T>, R extends Relations>
  implements DbTable<T, I, R>
{
  constructor(
    private client: RDSDataClient,
    private connection: Connection,
    private name: string,
    private schema: ObjectSchema,
    private relations: RepositoryRelationsWithSchema
  ) {}

  private parseRecord<T extends Record<string, unknown>>(record: T): T {
    const result: Record<string, unknown> = {};

    for (const fieldKey in record) {
      const value = record[fieldKey];

      if (typeof value === 'string') {
        const schema = this.schema.properties[fieldKey];

        if (schema?.type === SchemaType.Object) {
          result[fieldKey] = JSON.parse(value);
          continue;
        }

        if (this.relations[fieldKey]) {
          result[fieldKey] = JSON.parse(value);
          continue;
        }
      }

      result[fieldKey] = value;
    }

    return result as T;
  }

  private async sendCommand(input: PreparedQueryCommand | PreparedQueryCommand[]) {
    if (input instanceof Array) {
      return executeTransaction(this.client, this.connection, input);
    }

    return executeStatement(this.client, this.connection, input);
  }

  async insertOne(query: Query.InsertOneInput<T, I, R>): Promise<Query.InsertOneResult> {
    const command = await prepareInsertOne<T, I, R>(this.name, this.schema, this.relations, query);

    await this.sendCommand(command);
  }

  async updateOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateOneInput<T, S, I, R>
  ): Promise<Query.UpdateOneResult<T, S, R>> {
    const { select, data, where } = query;

    const updateQuery = {
      data,
      where
    };

    const updateCommand = await prepareUpdateOne<T, I, R, S>(
      this.name,
      this.schema,
      this.relations,
      updateQuery
    );

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined;
    }

    const selectCommand = prepareFindOne<T, I, R, S>(this.name, this.schema, this.relations, {
      select,
      where
    });

    const [[record]] = await this.sendCommand([selectCommand, updateCommand]);

    return this.parseRecord(record);
  }

  async findOne<S extends Query.SelectInput<T, R>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S, R>> {
    const command = prepareFindOne<T, I, R, S>(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S, R>> {
    const command = prepareDeleteOne<T, I, R, S>(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async upsertOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpsertOneInput<T, S, I, R>
  ): Promise<Query.UpsertOneResult<T, S, R>> {
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
    const commands = await prepareInsertMany<T, I, R>(
      this.name,
      this.schema,
      this.relations,
      query
    );

    await this.sendCommand(commands);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S, I, R>
  ): Promise<Query.UpdateManyResult<T, S, R>> {
    const { select, where, limit } = query;

    const updateCommand = await prepareUpdateMany<T, I, R, S>(
      this.name,
      this.schema,
      this.relations,
      query
    );

    if (!select) {
      await this.sendCommand(updateCommand);

      return [];
    }

    const selectCommand = prepareFindMany<T, I, R, S>(this.name, this.schema, this.relations, {
      select,
      where,
      limit
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }

  async findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I>
  ): Promise<Query.FindManyResult<T, S, R>> {
    const command = prepareFindMany<T, I, R, S>(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    return {
      records: records.map((record: AnyObject) => this.parseRecord(record)),
      ...(isAnyNumber(query.cursor) && {
        cursor: Number(query.cursor) + records.length
      })
    };
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S, R>> {
    const command = prepareDeleteMany<T, I, R, S>(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }
}
