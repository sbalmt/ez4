import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { Database, DatabaseTables } from './database.js';

/**
 * All supported index types.
 */
export const enum Index {
  Primary = 'primary',
  Secondary = 'secondary',
  Unique = 'unique',
  TTL = 'ttl'
}

/**
 * Given an index name `T`, it produces the decomposed index names.
 */
export type DecomposeIndexName<T> = T extends `${infer L}:${infer R}` ? L | DecomposeIndexName<R> : T;

/**
 * Given an index object `T`, it produces an object containing only primary indexes.
 */
export type PrimaryIndexes<T extends Database.Indexes> = {
  [P in keyof T as Index.Primary extends T[P] ? P : never]: T[P];
};

/**
 * Given an index object `T`, it produces an object containing only unique indexes.
 */
export type UniqueIndexes<T extends Database.Indexes> = {
  [P in keyof T as Index.Unique extends T[P] ? P : never]: T[P];
};

/**
 * Given an index object `T`, it produces an object containing only secondary indexes.
 */
export type SecondaryIndexes<T extends Database.Indexes> = {
  [P in keyof T as Index.Secondary | Index.TTL extends T[P] ? P : never]: T[P];
};

/**
 * Given an index object `T`, it produces the primary decomposed index names.
 */
export type DecomposePrimaryIndexNames<T extends Database.Indexes> = DecomposeIndexName<keyof PrimaryIndexes<T>>;

/**
 * Given an index object `T`, it produces the unique decomposed index names.
 */
export type DecomposeUniqueIndexNames<T extends Database.Indexes> = DecomposeIndexName<keyof UniqueIndexes<T>>;

/**
 * Given an index object `T`, it produces the secondary decomposed index names.
 */
export type DecomposeSecondaryIndexNames<T extends Database.Indexes> = DecomposeIndexName<keyof SecondaryIndexes<T>>;

/**
 * Given a database service `T`, it produces an object with all tables containing indexes.
 */
export type IndexedTables<T extends Database.Service> = MergeIndexes<DatabaseTables<T>>;

/**
 * Given a list of tables with indexes `T`, it produces another object containing all the
 * table indexes.
 */
type MergeIndexes<T extends Database.Table[]> = IsArrayEmpty<T> extends false ? TableIndexes<T[0]> & MergeIndexes<ArrayRest<T>> : {};

/**
 * Given a database table `T`, it produces an object containing all the table indexes.
 */
type TableIndexes<T> = T extends { name: infer N; indexes: infer I }
  ? N extends string
    ? I extends Database.Indexes
      ? { [P in N]: I }
      : {}
    : {}
  : {};
