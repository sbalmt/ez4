import type { TableIndex } from '@ez4/database/library';
import type { Table as DbTable, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { IsArray } from '@ez4/utils';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { PgClientDriver, PgExecuteStatement, PgExecutionResult } from '../types/driver';
import type { InternalTableMetadata } from '../types/table';

import { MissingUniqueIndexError } from '../queries/errors';
import { tryExtractUniqueIndex } from '../utils/indexes';

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
} from '../queries/queries';

export type TableContext = {
  transactionId?: string;
  driver: PgClientDriver;
  debug?: boolean;
};

type SendStatementResult<T> = IsArray<T> extends true ? PgExecutionResult[] : PgExecutionResult;

export class Table<T extends InternalTableMetadata> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private relations: PgRelationRepositoryWithSchema,
    private indexes: TableIndex[],
    private context: TableContext
  ) {}

  private async sendStatement<T extends PgExecuteStatement | PgExecuteStatement[]>(input: T): Promise<SendStatementResult<T>> {
    const { transactionId, driver, debug } = this.context;

    if (!Array.isArray(input)) {
      return driver.executeStatement(input, {
        transactionId,
        debug
      }) as Promise<SendStatementResult<T>>;
    }

    if (!transactionId) {
      return driver.executeTransaction(input, {
        debug
      }) as Promise<SendStatementResult<T>>;
    }

    return driver.executeStatements(input, {
      transactionId,
      debug
    }) as Promise<SendStatementResult<T>>;
  }

  async insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>) {
    const statement = await prepareInsertOne(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    return records[0] as Query.InsertOneResult<S, T>;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const statement = await prepareUpdateOne(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    return records[0] as Query.UpdateOneResult<S, T>;
  }

  async findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>) {
    const statement = prepareFindOne(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    return records[0] as Query.FindOneResult<S, T>;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const statement = prepareDeleteOne(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    return records[0] as Query.DeleteOneResult<S, T>;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const uniqueIndex = tryExtractUniqueIndex(this.indexes, query.where);

    if (!uniqueIndex) {
      throw new MissingUniqueIndexError();
    }

    const { driver } = this.context;

    const updateQuery = {
      select: query.select,
      include: query.include,
      data: query.update,
      where: query.where,
      lock: query.lock
    };

    const updateStatement = await prepareUpdateOne(this.name, this.schema, this.relations, driver, updateQuery, {
      flag: '__EZ4_OK'
    });

    const { records: updateRecords } = await this.sendStatement(updateStatement);

    if (updateRecords[0]?.__EZ4_OK) {
      delete updateRecords[0]?.__EZ4_OK;

      return {
        record: updateRecords[0],
        inserted: false
      } as Query.UpsertOneResult<S, T>;
    }

    const insertStatement = await prepareInsertOne(this.name, this.schema, this.relations, driver, {
      select: query.select,
      data: query.insert
    });

    const { records: insertRecords } = await this.sendStatement(insertStatement);

    return {
      record: insertRecords[0],
      inserted: true
    } as Query.UpsertOneResult<S, T>;
  }

  async insertMany(query: Query.InsertManyInput<T>) {
    const statements = await prepareInsertMany<T>(this.name, this.schema, this.relations, this.context.driver, query);

    await this.sendStatement(statements);
  }

  async updateMany<S extends Query.SelectInput<T>>(query: Query.UpdateManyInput<S, T>) {
    const statement = await prepareUpdateMany(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    if (query.select) {
      return records as Query.UpdateManyResult<S, T>;
    }

    return undefined as Query.UpdateManyResult<S, T>;
  }

  async findMany<S extends Query.SelectInput<T>, C extends boolean = false>(query: Query.FindManyInput<S, C, T>) {
    const findStatement = prepareFindMany(this.name, this.schema, this.relations, this.context.driver, query);
    const allStatements = [findStatement];

    if (query.count) {
      const countStatement = prepareCount(this.name, this.schema, this.relations, this.context.driver, {
        where: query.where
      });

      allStatements.push(countStatement);
    }

    const [{ records }, total] = await this.sendStatement(allStatements);

    return {
      records,
      ...(query.count && {
        total: Number(total.records[0]?.__EZ4_COUNT)
      })
    } as Query.FindManyResult<S, C, T>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const statement = prepareDeleteMany(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    if (query.select) {
      return records as Query.DeleteManyResult<S, T>;
    }

    return undefined as Query.DeleteManyResult<S, T>;
  }

  async count(query: Query.CountInput<T>) {
    const statement = prepareCount(this.name, this.schema, this.relations, this.context.driver, query);

    const { records } = await this.sendStatement(statement);

    return Number(records[0].__EZ4_COUNT);
  }
}
