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
  insertOne<S extends Query.SelectInput<T>>(query: Query.InsertOneInput<S, T>): Promise<Query.InsertOneResult<S, T>>;

  /**
   * Find one database record.
   *
   * @param query Input query.
   */
  findOne<S extends Query.SelectInput<T>>(query: Query.FindOneInput<S, T>): Promise<Query.FindOneResult<S, T>>;

  /**
   * Update one database record.
   *
   * @param query Input query.
   */
  updateOne<S extends Query.SelectInput<T>>(query: Query.UpdateOneInput<S, T>): Promise<Query.UpdateOneResult<S, T>>;

  /**
   * Try to insert a database record, and if it already exists, perform an update instead.
   *
   * @param query Input query.
   */
  upsertOne<S extends Query.SelectInput<T>>(query: Query.UpsertOneInput<S, T>): Promise<Query.UpsertOneResult<S, T>>;

  /**
   * Delete one database record.
   *
   * @param query Input query.
   */
  deleteOne<S extends Query.SelectInput<T>>(query: Query.DeleteOneInput<S, T>): Promise<Query.DeleteOneResult<S, T>>;

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
  findMany<S extends Query.SelectInput<T>, C extends boolean>(query: Query.FindManyInput<S, C, T>): Promise<Query.FindManyResult<S, C, T>>;

  /**
   * Update multiple database records.
   *
   * @param query Input query.
   */
  updateMany<S extends Query.SelectInput<T>>(query: Query.UpdateManyInput<S, T>): Promise<Query.UpdateManyResult<S, T>>;

  /**
   * Delete multiple database records.
   *
   * @param query Input query.
   */
  deleteMany<S extends Query.SelectInput<T>>(query: Query.DeleteManyInput<S, T>): Promise<Query.DeleteManyResult<S, T>>;

  /**
   * Count database records.
   *
   * @param query Input query.
   */
  count(query: Query.CountInput<T>): Promise<number>;
}
