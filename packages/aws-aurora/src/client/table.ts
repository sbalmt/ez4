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

export type TableSettings = {
  client: RDSDataClient;
  connection: Connection;
  debug?: boolean;
};

export class Table<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> implements DbTable<T, I, R> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private relations: RepositoryRelationsWithSchema,
    private settings: TableSettings
  ) {}

  private parseRecord<T extends Record<string, unknown>>(record: T): T {
    return parseRecord(record, this.schema, this.relations);
  }

  private async sendCommand(input: PreparedQueryCommand | PreparedQueryCommand[]) {
    const { client, connection, debug } = this.settings;

    if (!Array.isArray(input)) {
      return executeStatement(client, connection, input, undefined, debug);
    }

    if (input.length === 1) {
      return [await executeStatement(client, connection, input[0], undefined, debug)];
    }

    return executeTransaction(client, connection, input, debug);
  }

  async insertOne<S extends Query.SelectInput<T, R>>(query: Query.InsertOneInput<T, S, R>): Promise<Query.InsertOneResult<T, S, R>> {
    const command = await prepareInsertOne(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined as Query.InsertOneResult<T, S, R>;
  }

  async updateOne<S extends Query.SelectInput<T, R>>(query: Query.UpdateOneInput<T, S, I, R>): Promise<Query.UpdateOneResult<T, S, R>> {
    const { select, data, where } = query;

    const updateQuery = {
      data,
      where
    };

    const updateCommand = await prepareUpdateOne(this.name, this.schema, this.relations, updateQuery);

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

  async findOne<S extends Query.SelectInput<T, R>>(query: Query.FindOneInput<T, S, I, R>): Promise<Query.FindOneResult<T, S, R>> {
    const command = prepareFindOne(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(query: Query.DeleteOneInput<T, S, I, R>): Promise<Query.DeleteOneResult<T, S, R>> {
    const command = prepareDeleteOne(this.name, this.schema, this.relations, query);

    const [record] = await this.sendCommand(command);

    if (record) {
      return this.parseRecord(record);
    }

    return undefined;
  }

  async upsertOne<S extends Query.SelectInput<T, R>>(query: Query.UpsertOneInput<T, S, I, R>): Promise<Query.UpsertOneResult<T, S, R>> {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<T, S, R>),
      where: query.where
    });

    if (!previous) {
      return this.insertOne({
        data: query.insert
      }) as Promise<Query.UpsertOneResult<T, S, R>>;
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

  async updateMany<S extends Query.SelectInput<T, R>>(query: Query.UpdateManyInput<T, S, R>): Promise<Query.UpdateManyResult<T, S, R>> {
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

  async findMany<S extends Query.SelectInput<T, R>, C extends boolean>(
    query: Query.FindManyInput<T, S, I, R, C>
  ): Promise<Query.FindManyResult<T, S, R, C>> {
    const { cursor, count: shouldCount } = query;

    const findCommand = prepareFindMany(this.name, this.schema, this.relations, query);
    const allCommands = [findCommand];

    if (shouldCount) {
      const countCommand = prepareCount(this.name, this.schema, this.relations, {
        where: query.where
      });

      allCommands.push(countCommand);
    }

    const [records, total] = await this.sendCommand(allCommands);

    return {
      records: records.map((record: AnyObject) => {
        return this.parseRecord(record);
      }),
      ...(isAnyNumber(cursor) && {
        cursor: Number(cursor) + records.length
      }),
      ...(shouldCount && {
        total: total[0]?.count
      })
    } as Query.FindManyResult<T, S, R, C>;
  }

  async deleteMany<S extends Query.SelectInput<T, R>>(query: Query.DeleteManyInput<T, S, R>): Promise<Query.DeleteManyResult<T, S, R>> {
    const command = prepareDeleteMany(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    return records.map((record: AnyObject) => this.parseRecord(record));
  }

  async count(query: Query.CountInput<T, R>): Promise<number> {
    const command = prepareCount(this.name, this.schema, this.relations, query);

    const [{ count }] = await this.sendCommand(command);

    return count;
  }
}
