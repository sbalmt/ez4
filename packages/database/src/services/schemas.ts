import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { DatabaseTables } from './helpers.js';
import type { Database } from './database.js';

/**
 * Given a database service `T`, it produces an object containing all tables with schemas.
 */
export type TableSchemas<T extends Database.Service<any>> = MergeTables<DatabaseTables<T>>;

/**
 * Given a list of tables with schema `T`, it produces an object containing all schemas
 * mapped by table name.
 */
type MergeTables<T extends Database.Table[]> =
  IsArrayEmpty<T> extends true ? {} : TableSchema<T[0]> & MergeTables<ArrayRest<T>>;

/**
 * Given a database table `T`, it produces an object containing the `schema`.
 */
type TableSchema<T> = T extends { name: infer N; schema: infer S }
  ? N extends string
    ? { [P in N]: S }
    : {}
  : {};
