import type { AnyObject, ArrayRest, IsArrayEmpty, IsAny, PropertyType } from '@ez4/utils';
import type { RelationTableSchemas, RelationTableFields } from './relations.js';
import type { Indexes, IndexedTables } from './indexes.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { Query } from './query.js';

/**
 * Given an array of schemas `T`, it returns an union of `Database.Table` for each schema.
 */
export type TableTypes<T extends Database.Schema[]> =
  IsAny<T> extends true
    ? any
    : IsArrayEmpty<T> extends true
      ? Database.Table<Database.Schema>
      : Database.Table<T[0]> | TableTypes<ArrayRest<T>>;

/**
 * Given an indexed table `T` and a property `P`, it returns all the indexes corresponding
 * to the given property.
 */
export type TableIndex<P, T extends AnyObject> =
  PropertyType<P, T> extends Indexes ? PropertyType<P, T> : never;

/**
 * Given a database service `T`, it produces an object with all table schemas and relations.
 */
type AllSchemas<T extends Database.Service<any>> = {
  [P in keyof TableSchemas<T> | keyof RelationTableSchemas<T>]:
    | PropertyType<P, TableSchemas<T>>
    | (PropertyType<P, RelationTableSchemas<T>> &
        Omit<PropertyType<P, TableSchemas<T>>, keyof PropertyType<P, RelationTableFields<T>>>);
};

/**
 * Given a database service `T`, it returns all table clients.
 */
export type TableClients<T extends Database.Service<any>> = {
  [P in keyof AllSchemas<T>]: AllSchemas<T>[P] extends Database.Schema
    ? Table<AllSchemas<T>[P], TableIndex<P, IndexedTables<T>>>
    : never;
};

/**
 * Table client.
 */
export interface Table<T extends Database.Schema, I extends Indexes> {
  /**
   * Insert one record into the database.
   *
   * @param query Input query.
   */
  insertOne(query: Query.InsertOneInput<T>): Promise<Query.InsertOneResult>;

  /**
   * Find one database record.
   *
   * @param query Input query.
   */
  findOne<S extends Query.SelectInput<T>>(
    query: Query.FindOneInput<T, S, I>
  ): Promise<Query.FindOneResult<T, S>>;

  /**
   * Update one database record.
   *
   * @param query Input query.
   */
  updateOne<S extends Query.SelectInput<T>>(
    query: Query.UpdateOneInput<T, S, I>
  ): Promise<Query.UpdateOneResult<T, S>>;

  /**
   * Try to insert a database record, and if it already exists, perform an update instead.
   *
   * @param query Input query.
   */
  upsertOne<S extends Query.SelectInput<T>>(
    query: Query.UpsertOneInput<T, S, I>
  ): Promise<Query.UpsertOneResult<T, S>>;

  /**
   * Delete one database record.
   *
   * @param query Input query.
   */
  deleteOne<S extends Query.SelectInput<T>>(
    query: Query.DeleteOneInput<T, S, I>
  ): Promise<Query.DeleteOneResult<T, S>>;

  /**
   * Insert multiple records into the database.
   *
   * @param query Input query.
   */
  insertMany(query: Query.InsertManyInput<T>): Promise<Query.InsertManyResult>;

  /**
   * Find multiple database records.
   *
   * @param query Input query.
   */
  findMany<S extends Query.SelectInput<T>>(
    query: Query.FindManyInput<T, S, I>
  ): Promise<Query.FindManyResult<T, S>>;

  /**
   * Update multiple database records.
   *
   * @param query Input query.
   */
  updateMany<S extends Query.SelectInput<T>>(
    query: Query.UpdateManyInput<T, S>
  ): Promise<Query.UpdateManyResult<T, S>>;

  /**
   * Delete multiple database records.
   *
   * @param query Input query.
   */
  deleteMany<S extends Query.SelectInput<T>>(
    query: Query.DeleteManyInput<T, S>
  ): Promise<Query.DeleteManyResult<T, S>>;
}
