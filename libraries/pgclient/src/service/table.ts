import type { TableIndex } from '@ez4/database/library';
import type { Table as DbTable, Query } from '@ez4/database';
import type { AnyObject, IsArray } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { PgClientDriver, PgExecuteStatement } from '../types/driver';
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

type SendStatementResult<T> = IsArray<T> extends true ? AnyObject[][] : AnyObject[];

type SendStatementOptions = {
  silent?: boolean;
};

export class Table<T extends InternalTableMetadata> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private relations: PgRelationRepositoryWithSchema,
    private indexes: TableIndex[],
    private context: TableContext
  ) {}

  private async sendStatement<T extends PgExecuteStatement | PgExecuteStatement[]>(
    input: T,
    options?: SendStatementOptions
  ): Promise<SendStatementResult<T>> {
    const { transactionId, driver, debug } = this.context;

    if (!Array.isArray(input)) {
      return driver.executeStatement(input, { ...options, transactionId, debug }) as Promise<SendStatementResult<T>>;
    }

    if (!transactionId) {
      return driver.executeTransaction(input, {
        ...options,
        debug
      });
    }

    return driver.executeStatements(input, {
      ...options,
      transactionId,
      debug
    });
  }

  async insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>) {
    const statement = await prepareInsertOne(this.name, this.schema, this.relations, this.context.driver, query);

    const results = await this.sendStatement(statement);

    return results?.[0] as Query.InsertOneResult<S, T>;
  }

  async updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>) {
    const updateQuery = {
      data: query.data,
      where: query.where
    };

    const updateStatement = await prepareUpdateOne(this.name, this.schema, this.relations, this.context.driver, updateQuery);

    if (!query.select) {
      await this.sendStatement(updateStatement);

      return undefined as Query.UpdateOneResult<S, T>;
    }

    const selectStatement = prepareFindOne(this.name, this.schema, this.relations, this.context.driver, {
      select: query.select,
      include: query.include,
      where: query.where
    });

    const [records] = await this.sendStatement([selectStatement, updateStatement]);

    return records?.[0] as Query.UpdateOneResult<S, T>;
  }

  async findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>) {
    const statement = prepareFindOne(this.name, this.schema, this.relations, this.context.driver, query);

    const records = await this.sendStatement(statement);

    return records?.[0] as Query.FindOneResult<S, T>;
  }

  async deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>) {
    const statement = prepareDeleteOne(this.name, this.schema, this.relations, this.context.driver, query);

    const records = await this.sendStatement(statement);

    return records?.[0] as Query.DeleteOneResult<S, T>;
  }

  async upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>) {
    const uniqueIndex = tryExtractUniqueIndex(this.indexes, query.where);

    if (!uniqueIndex) {
      throw new MissingUniqueIndexError();
    }

    try {
      const insertStatement = await prepareInsertOne(this.name, this.schema, this.relations, this.context.driver, {
        select: query.select,
        data: query.insert
      });

      const insertResults = await this.sendStatement(insertStatement, {
        silent: true
      });

      return insertResults[0] as Query.UpsertOneResult<S, T>;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('duplicate')) {
        throw error;
      }

      const updateStatement = await prepareUpdateOne(this.name, this.schema, this.relations, this.context.driver, {
        select: query.select,
        include: query.include,
        data: query.update,
        where: query.where,
        lock: query.lock
      });

      const updateResults = await this.sendStatement(updateStatement);

      return updateResults?.[0] as Query.UpsertOneResult<S, T>;
    }
  }

  async insertMany(query: Query.InsertManyInput<T>) {
    const statements = await prepareInsertMany<T>(this.name, this.schema, this.relations, this.context.driver, query);

    await this.sendStatement(statements);
  }

  async updateMany<S extends Query.SelectInput<T>>(query: Query.UpdateManyInput<S, T>) {
    const updateStatement = await prepareUpdateMany(this.name, this.schema, this.relations, this.context.driver, query);

    if (!query.select) {
      await this.sendStatement(updateStatement);

      return undefined as Query.UpdateManyResult<S, T>;
    }

    const selectStatement = prepareFindMany(this.name, this.schema, this.relations, this.context.driver, {
      select: query.select,
      include: query.include,
      where: query.where,
      ...('take' in query && {
        take: query.take
      })
    });

    const [records] = await this.sendStatement([selectStatement, updateStatement]);

    return records as Query.UpdateManyResult<S, T>;
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

    const [records, total] = await this.sendStatement(allStatements);

    return {
      records,
      ...(query.count && {
        total: total[0]?.count
      })
    } as Query.FindManyResult<S, C, T>;
  }

  async deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>) {
    const statement = prepareDeleteMany(this.name, this.schema, this.relations, this.context.driver, query);

    const records = await this.sendStatement(statement);

    return records as Query.DeleteManyResult<S, T>;
  }

  async count(query: Query.CountInput<T>) {
    const statement = prepareCount(this.name, this.schema, this.relations, this.context.driver, query);

    const [{ __EZ4_COUNT }] = await this.sendStatement(statement);

    return __EZ4_COUNT;
  }
}
