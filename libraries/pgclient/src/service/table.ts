import type { Table as DbTable, Query } from '@ez4/database';
import type { AnyObject, IsArray } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { PgRelationRepositoryWithSchema } from '../types/repository.js';
import type { PgClientDriver, PgExecuteStatement } from '../types/driver.js';
import type { InternalTableMetadata } from '../types/table.js';

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
} from '../queries/queries.js';

export type TableContext = {
  transactionId?: string;
  driver: PgClientDriver;
  debug?: boolean;
};

type SendStatementResult<T> = IsArray<T> extends true ? AnyObject[][] : AnyObject[];

export class Table<T extends InternalTableMetadata> implements DbTable<T> {
  constructor(
    private name: string,
    private schema: ObjectSchema,
    private relations: PgRelationRepositoryWithSchema,
    private context: TableContext
  ) {}

  private async sendStatement<T extends PgExecuteStatement | PgExecuteStatement[]>(input: T): Promise<SendStatementResult<T>> {
    const { transactionId, driver, debug } = this.context;

    if (!Array.isArray(input)) {
      return driver.executeStatement(input, { transactionId, debug }) as Promise<SendStatementResult<T>>;
    }

    if (!transactionId) {
      return driver.executeTransaction(input, {
        debug
      });
    }

    return driver.executeStatements(input, {
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
    const previous = await this.findOne({
      select: query.select ?? ({} as Query.StrictSelectInput<S, T>),
      include: query.include,
      where: query.where
    });

    if (!previous) {
      return this.insertOne({
        select: query.select,
        data: query.insert
      }) as Promise<Query.UpsertOneResult<S, T>>;
    }

    await this.updateOne({
      where: query.where,
      data: query.update
    });

    return previous as Query.UpsertOneResult<S, T>;
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

    const [{ count }] = await this.sendStatement(statement);

    return count;
  }
}
