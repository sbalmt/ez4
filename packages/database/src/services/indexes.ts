import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { DatabaseTables } from './helpers.js';
import type { Database } from './database.js';

/**
 * All supported index types.
 */
export const enum Index {
  Primary = 'primary',
  Regular = 'regular',
  Unique = 'unique',
  TTL = 'ttl'
}

/**
 * Given an index name `T`, it produces the decomposed index names.
 */
export type DecomposeIndexName<T> = T extends `${infer L}:${infer R}`
  ? L | DecomposeIndexName<R>
  : T;

/**
 * Given an index object `T`, it produces an index object containing only primary indexes.
 */
export type PrimaryIndexes<T> = {
  [P in keyof T as T[P] extends Index.Primary ? P : never]: T[P];
};

/**
 * Given a database service `T`, it produces an object containing all tables with indexes.
 */
export type TableIndexes<T extends Database.Service<any>> = MergeIndexes<DatabaseTables<T>>;

/**
 * Given a list of tables with indexes `T`, it produces an object containing all primary
 * indexes mapped by table name.
 */
type MergeIndexes<T extends Database.Table[]> =
  IsArrayEmpty<T> extends true ? {} : TableIndex<T[0]> & MergeIndexes<ArrayRest<T>>;

/**
 * Given a database table `T`, it produces an object containing all the primary index names.
 */
type TableIndex<T> = T extends {
  name: infer N;
  indexes: infer I;
}
  ? N extends string
    ? {
        [P in N]: DecomposeIndexName<keyof PrimaryIndexes<I>>;
      }
    : {}
  : {};
