import type { TableIndexes } from './indexes.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { Transaction } from './transaction.js';
import type { Query } from './query.js';

/**
 * Database client.
 */
export type Client<T extends Database.Service<any>> = ClientTables<T> & {
  /**
   * Prepare and execute the given query.
   *
   * @param query Query statement.
   * @param values Optional values to prepare the query.
   * @returns Returns the results for the given query.
   */
  rawQuery(query: string, values?: unknown[]): Promise<Record<string, unknown>[]>;

  /**
   * Prepare and execute the given transaction.
   *
   * @param operations Transaction operations.
   */
  transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void>;
};

/**
 * Client tables.
 */
export type ClientTables<T extends Database.Service<any>> = {
  [P in keyof TableSchemas<T>]: TableSchemas<T>[P] extends Database.Schema
    ? Table<
        TableSchemas<T>[P],
        P extends keyof TableIndexes<T>
          ? TableIndexes<T>[P] extends string
            ? TableIndexes<T>[P]
            : never
          : never
      >
    : never;
};

/**
 * Client table.
 */
export interface Table<T extends Database.Schema, I extends string | never> {
  insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult>;

  findOne<S extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S>>;

  updateOne<S extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, S, I>
  ): Promise<Query.UpdateOneResult<T, S>>;

  upsertOne<S extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, S, I>
  ): Promise<Query.UpsertOneResult<T, S>>;

  deleteOne<S extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S>>;

  insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult>;

  findMany<S extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, S, I>
  ): Promise<Query.FindManyResult<T, S>>;

  updateMany<S extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S>>;

  deleteMany<S extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S>>;
}
