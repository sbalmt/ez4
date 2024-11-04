import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { DatabaseTables } from './helpers.js';
import type { Database } from './database.js';

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
 * Given an index object `T`, it produces another object containing only primary indexes.
 */
export type PrimaryIndexes<T> = {
  [P in keyof T as T[P] extends Index.Primary ? P : never]: T[P];
};

/**
 * Given an index object `T`, it produces another object containing only secondary indexes.
 */
export type SecondaryIndexes<T> = {
  [P in keyof T as T[P] extends Index.Secondary ? P : never]: T[P];
};

/**
 * Given a database service `T`, it produces an object containing all tables with indexes.
 */
export type TableIndexes<T extends Database.Service<any>> = MergeIndexes<DatabaseTables<T>>;

/**
 * Given a list of tables with indexes `T`, it produces another object containing all the
 * table indexes mapped by table name.
 */
type MergeIndexes<T extends Database.Table[]> =
  IsArrayEmpty<T> extends true ? {} : TableIndex<T[0]> & MergeIndexes<ArrayRest<T>>;

/**
 * Given a database table `T`, it produces another object containing all its index names.
 */
type TableIndex<T> = T extends {
  name: infer N;
  indexes: infer I;
}
  ? N extends string
    ? {
        [P in N]:
          | IndexProperties<Index.Secondary, DecomposeIndexName<keyof SecondaryIndexes<I>>>
          | IndexProperties<Index.Primary, DecomposeIndexName<keyof PrimaryIndexes<I>>>;
      }
    : {}
  : {};

/**
 * Given a union of indexes `U`, it produces another object containing the index type `T`
 * for each index within the union.
 */
type IndexProperties<T extends Index, U extends string> = U extends never ? {} : { [P in U]: T };
