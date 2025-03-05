import type { Database, RelationMetadata, Query, Table as DbTable } from '@ez4/database';
import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { PreparedQueryCommand } from './common/queries.js';
import type { Connection } from './types.js';

import { isAnyNumber } from '@ez4/utils';

import { executeStatement, executeTransaction } from './common/client.js';
import { parseRecord } from './common/record.js';

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
    private relations: RepositoryRelationsWithSchema,
    private settings: {
      client: RDSDataClient;
      connection: Connection;
      debug?: boolean;
    }
  ) {}

  private parseRecord<T extends Record<string, unknown>>(record: T): T {
    return parseRecord(record, this.schema, this.relations);
  }

  private async sendCommand(input: PreparedQueryCommand | PreparedQueryCommand[]) {
    const { client, connection, debug } = this.settings;

    if (input instanceof Array) {
      return executeTransaction(client, connection, input, debug);
    }

    return executeStatement(client, connection, input, undefined, debug);
  }

  async insertOne(query: Query.InsertOneInput<T, R>): Promise<Query.InsertOneResult> {
    const command = await prepareInsertOne(this.name, this.schema, this.relations, query);

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

    const updateCommand = await prepareUpdateOne(
      this.name,
      this.schema,
      this.relations,
      updateQuery
    );

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined;
    }

    const selectCommand = prepareFindOne(this.name, this.schema, this.relations, {
      select,
      where
    });

    const [[record]] = await this.sendCommand([selectCommand, updateCommand]);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async findOne<S extends Query.SelectInput<T, R>>(
    query: Query.FindOneInput<T, S, I, R>
  ): Promise<Query.FindOneResult<T, S, R>> {
    const command = prepareFindOne(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I, R>
  ): Promise<Query.DeleteOneResult<T, S, R>> {
    const command = prepareDeleteOne(this.name, this.schema, this.relations, query);

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
      select: query.select ?? ({} as Query.StrictSelectInput<T, S, R>),
      where: query.where
    });

    if (!previous) {
      await this.insertOne({
        data: query.insert
      });

      return previous;
    }

    await this.updateOne({
      select: query.select,
      where: query.where,
      data: query.update
    });

    return previous;
  }

  async insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult> {
    const commands = await prepareInsertMany<T>(this.name, this.schema, this.relations, query);

    await this.sendCommand(commands);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S, R>
  ): Promise<Query.UpdateManyResult<T, S, R>> {
    const { select, where, limit } = query;

    const updateCommand = await prepareUpdateMany(this.name, this.schema, this.relations, query);

    if (!select) {
      await this.sendCommand(updateCommand);

      return [];
    }

    const selectCommand = prepareFindMany(this.name, this.schema, this.relations, {
      select,
      where,
      limit
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }

  async findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I, R>
  ): Promise<Query.FindManyResult<T, S, R>> {
    const command = prepareFindMany(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    return {
      records: records.map((record: AnyObject) => this.parseRecord(record)),
      ...(isAnyNumber(query.cursor) && {
        cursor: Number(query.cursor) + records.length
      })
    };
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S, R>
  ): Promise<Query.DeleteManyResult<T, S, R>> {
    const command = prepareDeleteMany(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }

  async count(query: Query.CountInput<T, R>): Promise<number> {
    const command = prepareCount(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    return this.parseRecord(record).count;
  }
}
