import type { Table as DbTable, Query } from '@ez4/database';
import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { AnyObject, IsArray } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { PreparedQueryCommand } from './common/queries.js';
import type { Connection, InternalTableMetadata } from './types.js';

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

export class Table<T extends InternalTableMetadata> implements DbTable<T> {
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

  async insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>) {
    const command = await prepareInsertOne(this.name, this.schema, this.relations, query);

    const results = await this.sendCommand(command);

    if (results.length > 0) {
      return this.parseRecord(results[0]) as Query.InsertOneResult<S, T>;
    }

    return undefined as Query.InsertOneResult<S, T>;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const { select, data, where } = query;

    const updateQuery = {
      data,
      where
    };

    const updateCommand = await prepareUpdateOne(this.name, this.schema, this.relations, updateQuery);

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined as Query.UpdateOneResult<S, T>;
    }

    const selectCommand = prepareFindOne(this.name, this.schema, this.relations, {
      select,
      where
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.UpdateOneResult<S, T>;
    }

    return undefined as Query.UpdateOneResult<S, T>;
  }

  async findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>) {
    const command = prepareFindOne(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.FindOneResult<S, T>;
    }

    return undefined as Query.FindOneResult<S, T>;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const command = prepareDeleteOne(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return this.parseRecord(records[0]) as Query.DeleteOneResult<S, T>;
    }

    return undefined as Query.DeleteOneResult<S, T>;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<S, T>),
      where: query.where
    });

    if (!previous) {
      return this.insertOne({
        select: query.select,
        data: query.insert
      }) as Promise<Query.UpsertOneResult<S, T>>;
    }

    await this.updateOne({
      select: query.select,
      where: query.where,
      data: query.update
    });

    return previous as Query.UpsertOneResult<S, T>;
  }

  async insertMany(query: Query.InsertManyInput<T>) {
    const commands = await prepareInsertMany<T>(this.name, this.schema, this.relations, query);

    await this.sendCommand(commands);
  }

  async updateMany<S extends Query.SelectInput<T>>(query: Query.UpdateManyInput<S, T>) {
    const { select, where } = query;

    const updateCommand = await prepareUpdateMany(this.name, this.schema, this.relations, query);

    if (!select) {
      await this.sendCommand(updateCommand);

      return undefined as Query.UpdateManyResult<S, T>;
    }

    const selectCommand = prepareFindMany(this.name, this.schema, this.relations, {
      select,
      where,
      ...('take' in query && {
        take: query.take
      })
    });

    const [records] = await this.sendCommand([selectCommand, updateCommand]);

    if (records.length > 0) {
      return records.map((record: AnyObject) => this.parseRecord(record)) as Query.UpdateManyResult<S, T>;
    }

    return [] as unknown as Query.UpdateManyResult<S, T>;
  }

  async findMany<S extends Query.SelectInput<T>, C extends boolean = false>(query: Query.FindManyInput<S, T, C>) {
    const { count: shouldCount } = query;

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
      ...(shouldCount && {
        total: total[0]?.count
      })
    } as Query.FindManyResult<S, T, C>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const command = prepareDeleteMany(this.name, this.schema, this.relations, query);

    const records = await this.sendCommand(command);

    if (records.length > 0) {
      return records.map((record: AnyObject) => this.parseRecord(record)) as Query.DeleteManyResult<S, T>;
    }

    return [];
  }

  async count(query: Query.CountInput<T>) {
    const command = prepareCount(this.name, this.schema, this.relations, query);

    const [{ count }] = await this.sendCommand(command);

    return count;
  }
}
