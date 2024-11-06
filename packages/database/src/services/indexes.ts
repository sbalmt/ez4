import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { Database, DatabaseTables } from './database.js';

/**
 * All supported index types.
 */
export const enum Index {
  Primary = 'primary',
  Secondary = 'secondary',
  TTL = 'ttl'
}

/**
 * An object containing only indexes.
 */
export type Indexes = {
  [name: string]: Index;
};

/**
 * Given an index name `T`, it produces the decomposed index names.
 */
export type DecomposeIndexName<T> = T extends `${infer L}:${infer R}`
  ? L | DecomposeIndexName<R>
  : T;

/**
 * Given an index object `T`, it produces an object containing only primary indexes.
 */
export type PrimaryIndexes<T> = {
  [P in keyof T as T[P] extends Index.Primary ? P : never]: T[P];
};

/**
 * Given an index object `T`, it produces an object containing only secondary indexes.
 */
export type SecondaryIndexes<T> = {
  [P in keyof T as T[P] extends Index.Secondary ? P : never]: T[P];
};

/**
 * Given a database service `T`, it produces an object with all tables containing indexes.
 */
export type IndexedTables<T extends Database.Service<any>> = MergeIndexes<DatabaseTables<T>>;

/**
 * Given a list of tables with indexes `T`, it produces another object containing all the
 * table indexes.
 */
type MergeIndexes<T extends Database.Table[]> =
  IsArrayEmpty<T> extends true ? {} : TableIndexes<T[0]> & MergeIndexes<ArrayRest<T>>;

/**
 * Given a union of indexes `U`, it produces an object with the index type `T` for each index
 * within the union.
 */
type IndexProperties<T extends Index, U extends string> = U extends never ? {} : { [P in U]: T };

/**
 * Given a database table `T`, it produces an object containing all the table indexes.
 */
type TableIndexes<T> = T extends { name: infer N; indexes: infer I }
  ? N extends string
    ? {
        [P in N]:
          | IndexProperties<Index.Secondary, DecomposeIndexName<keyof SecondaryIndexes<I>>>
          | IndexProperties<Index.Primary, DecomposeIndexName<keyof PrimaryIndexes<I>>>;
      }
    : {}
  : {};
