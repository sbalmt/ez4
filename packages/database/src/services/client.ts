import type { TableSchemas } from './helpers.js';
import type { Database } from './database.js';
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
};

/**
 * Client tables.
 */
export type ClientTables<T extends Database.Service<any>> = {
  [P in keyof TableSchemas<T>]: TableSchemas<T>[P] extends Database.Schema
    ? Table<TableSchemas<T>[P]>
    : never;
};

/**
 * Client table.
 */
export interface Table<T extends Database.Schema> {
  insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult>;

  updateOne<U extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, U>
  ): Promise<Query.UpdateOneResult<T, U>>;

  findOne<U extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, U>
  ): Promise<Query.FindOneResult<T, U>>;

  upsertOne<U extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, U>
  ): Promise<Query.UpsertOneResult<T, U>>;

  deleteOne<U extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, U>
  ): Promise<Query.DeleteOneResult<T, U>>;

  insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult>;

  updateMany<U extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, U>
  ): Promise<Query.UpdateManyResult<T, U>>;

  findMany<U extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, U>
  ): Promise<Query.FindManyResult<T, U>>;

  deleteMany<U extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, U>
  ): Promise<Query.DeleteManyResult<T, U>>;
}
