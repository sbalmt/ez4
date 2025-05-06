import type { Database, RelationMetadata, Query, Table as DbTable } from '@ez4/database';
import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { AnyObject, IsArray } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { PreparedQueryCommand } from './common/queries.js';
import type { Connection } from './types.js';

import { isAnyNumber } from '@ez4/utils';

import { executeStatement, executeStatements, executeTransaction } from './common/client.js';
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

export type TableContext = {
  transactionId?: string;
  connection: Connection;
  client: RDSDataClient;
  debug?: boolean;
};

type SendCommandResult<T> = IsArray<T> extends true ? AnyObject[][] : AnyObject[];

export class Table<T extends Database.Schema, I extends Database.Indexes, R extends RelationMetadata> implements DbTable<T, I, R> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private relations: RepositoryRelationsWithSchema,
    private context: TableContext
  ) {}

  private async sendCommand<T extends PreparedQueryCommand | PreparedQueryCommand[]>(input: T): Promise<SendCommandResult<T>> {
    const { transactionId, connection, client, debug } = this.context;

    if (!Array.isArray(input)) {
      return executeStatement(client, connection, input, transactionId, debug) as Promise<SendCommandResult<T>>;
    }

    if (input.length === 1) {
      return [await executeStatement(client, connection, input[0], transactionId, debug)];
    }

    if (transactionId) {
      return executeStatements(client, connection, input, transactionId, debug);
    }

    return executeTransaction(client, connection, input, debug);
  }

  private parseRecord<T extends Record<string, unknown>>(record: T): T | undefined {
    return parseRecord(record, this.schema, this.relations);
  }

  async insertOne<S extends Query.SelectInput<T, R>>(query: Query.InsertOneInput<T, S, R>) {
    const command = await prepareInsertOne(this.name, this.schema, this.relations, query);

    const results = await this.sendCommand(command);

    if (results.length > 0) {
      return this.parseRecord(results[0]) as Query.InsertOneResult<T, S, R>;
    }

    return undefined as Query.InsertOneResult<T, S, R>;
  }

  async updateOne<S extends Query.SelectInput<T, R>>(query: Query.UpdateOneInput<T, S, I, R>) {
    const { select, data, where } = query;

    const updateQuery = {
      data,
      where
    };

    const updateCommand = await prepareUpdateOne(this.name, this.schema, this.relations, updateQuery);

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined as Query.UpdateOneResult<T, S, R>;
    }

    const selectCommand = prepareFindOne(this.name, this.schema, this.relations, {
      select,
      where
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.UpdateOneResult<T, S, R>;
    }

    return undefined as Query.UpdateOneResult<T, S, R>;
  }

  async findOne<S extends Query.SelectInput<T, R>>(query: Query.FindOneInput<T, S, I, R>) {
    const command = prepareFindOne(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.FindOneResult<T, S, R>;
    }

    return undefined as Query.FindOneResult<T, S, R>;
  }

  async deleteOne<S extends Query.SelectInput<T, R>>(query: Query.DeleteOneInput<T, S, I, R>) {
    const command = prepareDeleteOne(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.DeleteOneResult<T, S, R>;
    }

    return undefined as Query.DeleteOneResult<T, S, R>;
  }

  async upsertOne<S extends Query.SelectInput<T, R>>(query: Query.UpsertOneInput<T, S, I, R>) {
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

    return previous as Query.UpsertOneResult<T, S, R>;
  }

  async insertMany(query: Query.InsertManyInput<T>) {
    const commands = await prepareInsertMany<T>(this.name, this.schema, this.relations, query);

    await this.sendCommand(commands);
  }

  async updateMany<S extends Query.SelectInput<T, R>>(query: Query.UpdateManyInput<T, S, R>) {
    const { select, where, limit } = query;

    const updateCommand = await prepareUpdateMany(this.name, this.schema, this.relations, query);

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined as Query.UpdateManyResult<T, S, R>;
    }

    const selectCommand = prepareFindMany(this.name, this.schema, this.relations, {
      select,
      where,
      limit
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    if (records.length > 0) {
      return records.map((record: AnyObject) => this.parseRecord(record)) as Query.UpdateManyResult<T, S, R>;
    }

    return [] as unknown as Query.UpdateManyResult<T, S, R>;
  }

  async findMany<S extends Query.SelectInput<T, R>, C extends boolean = false>(query: Query.FindManyInput<T, S, I, R, C>) {
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

  async deleteMany<S extends Query.SelectInput<T, R>>(query: Query.DeleteManyInput<T, S, R>) {
    const command = prepareDeleteMany(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return records.map((record: AnyObject) => this.parseRecord(record)) as Query.DeleteManyResult<T, S, R>;
    }

    return [];
  }

  async count(query: Query.CountInput<T, R>) {
    const command = prepareCount(this.name, this.schema, this.relations, query);

    const [{ count }] = await this.sendCommand(command);

    return count;
  }
}
