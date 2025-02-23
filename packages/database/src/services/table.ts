import type { AnyObject, ArrayRest, IsArrayEmpty, IsAny, PropertyExists } from '@ez4/utils';
import type { RelationMetadata, RelationTables } from './relations.js';
import type { IndexedTables } from './indexes.js';
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
  PropertyExists<P, T> extends true ? (T[P] extends Database.Indexes ? T[P] : {}) : {};

/**
 * Given a table `T` and a property `P`, it returns all the relations corresponding to the
 * given property.
 */
export type TableRelation<P, T extends AnyObject> =
  PropertyExists<P, T> extends true
    ? T[P] extends RelationMetadata
      ? T[P]
      : RelationMetadata
    : RelationMetadata;

/**
 * Given a database service `T`, it returns all table clients.
 */
export type TableClients<T extends Database.Service<any>> = {
  [P in keyof TableSchemas<T>]: TableSchemas<T>[P] extends Database.Schema
    ? Table<
        TableSchemas<T>[P],
        TableIndex<P, IndexedTables<T>>,
        TableRelation<P, RelationTables<T>>
      >
    : never;
};

/**
 * Table client.
 */
export interface Table<
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
> {
  /**
   * Insert one record into the database.
   *
   * @param query Input query.
   */
  insertOne(query: Query.InsertOneInput<T, R>): Promise<Query.InsertOneResult>;

  /**
   * Find one database record.
   *
   * @param query Input query.
   */
  findOne<S extends Query.SelectInput<T, R>>(
    query: Query.FindOneInput<T, S, I, R>
  ): Promise<Query.FindOneResult<T, S, R>>;

  /**
   * Update one database record.
   *
   * @param query Input query.
   */
  updateOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateOneInput<T, S, I, R>
  ): Promise<Query.UpdateOneResult<T, S, R>>;

  /**
   * Try to insert a database record, and if it already exists, perform an update instead.
   *
   * @param query Input query.
   */
  upsertOne<S extends Query.SelectInput<T, R>>(
    query: Query.UpsertOneInput<T, S, I, R>
  ): Promise<Query.UpsertOneResult<T, S, R>>;

  /**
   * Delete one database record.
   *
   * @param query Input query.
   */
  deleteOne<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteOneInput<T, S, I, R>
  ): Promise<Query.DeleteOneResult<T, S, R>>;

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
  findMany<S extends Query.SelectInput<T, R>>(
    query: Query.FindManyInput<T, S, I, R>
  ): Promise<Query.FindManyResult<T, S, R>>;

  /**
   * Update multiple database records.
   *
   * @param query Input query.
   */
  updateMany<S extends Query.SelectInput<T, R>>(
    query: Query.UpdateManyInput<T, S, R>
  ): Promise<Query.UpdateManyResult<T, S, R>>;

  /**
   * Delete multiple database records.
   *
   * @param query Input query.
   */
  deleteMany<S extends Query.SelectInput<T, R>>(
    query: Query.DeleteManyInput<T, S, R>
  ): Promise<Query.DeleteManyResult<T, S, R>>;

  /**
   * Count database records.
   *
   * @param query Input query.
   */
  count(query: Query.CountInput<T, R>): Promise<number>;
}
