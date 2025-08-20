import type { AnyObject, PropertyExists } from '@ez4/utils';
import type { RelationMetadata, RelationTables } from './relations.js';
import type { IndexedTables } from './indexes.js';
import type { TableSchemas } from './schemas.js';
import type { Database } from './database.js';
import type { DatabaseEngine } from './engine.js';
import type { Query } from './query.js';

/**
 * Given an indexed table `T` and a property `P`, it returns all the indexes corresponding
 * to the given property.
 */
export type TableIndex<P, T extends AnyObject> = PropertyExists<P, T> extends true ? (T[P] extends Database.Indexes ? T[P] : {}) : {};

/**
 * Given a table `T` and a property `P`, it returns all the relations corresponding to the
 * given property.
 */
export type TableRelation<P, T extends AnyObject> =
  PropertyExists<P, T> extends true ? (T[P] extends RelationMetadata ? T[P] : RelationMetadata) : RelationMetadata;

/**
 * Given a database service `T`, it returns all table clients.
 */
export type TableClients<T extends Database.Service> = {
  [P in keyof TableSchemas<T>]: TableSchemas<T>[P] extends Database.Schema
    ? Table<{
        schema: TableSchemas<T>[P];
        indexes: TableIndex<P, IndexedTables<T>>;
        relations: TableRelation<P, RelationTables<T>>;
        engine: T['engine'];
      }>
    : never;
};

/**
 * Internal table metadata.
 */
export type TableMetadata = {
  schema: Database.Schema;
  indexes: Database.Indexes;
  relations: RelationMetadata;
  engine: DatabaseEngine;
};

/**
 * Table client.
 */
export interface Table<T extends TableMetadata> {
  /**
   * Insert one record into the database.
   *
   * @param query Input query.
   */
  insertOne<S extends Query.SelectInput<T>, Q extends Query.InsertOneInput<S, T>>(query: Q): Promise<Query.InsertOneResult<Q, T>>;

  /**
   * Find one database record.
   *
   * @param query Input query.
   */
  findOne<S extends Query.SelectInput<T>, Q extends Query.FindOneInput<S, T>>(query: Q): Promise<Query.FindOneResult<Q, T>>;

  /**
   * Update one database record.
   *
   * @param query Input query.
   */
  updateOne<S extends Query.SelectInput<T>, Q extends Query.UpdateOneInput<S, T>>(query: Q): Promise<Query.UpdateOneResult<Q, T>>;

  /**
   * Try to insert a database record, and if it already exists, perform an update instead.
   *
   * @param query Input query.
   */
  upsertOne<S extends Query.SelectInput<T>, Q extends Query.UpsertOneInput<S, T>>(query: Q): Promise<Query.UpsertOneResult<Q, T>>;

  /**
   * Delete one database record.
   *
   * @param query Input query.
   */
  deleteOne<S extends Query.SelectInput<T>, Q extends Query.DeleteOneInput<S, T>>(query: Q): Promise<Query.DeleteOneResult<Q, T>>;

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
  findMany<S extends Query.SelectInput<T>, Q extends Query.FindManyInput<S, T>>(query: Q): Promise<Query.FindManyResult<Q, T>>;

  /**
   * Update multiple database records.
   *
   * @param query Input query.
   */
  updateMany<S extends Query.SelectInput<T>, Q extends Query.UpdateManyInput<S, T>>(query: Q): Promise<Query.UpdateManyResult<Q, T>>;

  /**
   * Delete multiple database records.
   *
   * @param query Input query.
   */
  deleteMany<S extends Query.SelectInput<T>, Q extends Query.DeleteManyInput<S, T>>(query: Q): Promise<Query.DeleteManyResult<Q, T>>;

  /**
   * Count database records.
   *
   * @param query Input query.
   */
  count(query: Query.CountInput<T>): Promise<number>;
}
