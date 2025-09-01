import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { Database, DatabaseTables } from './database';

/**
 * Given a database service `T`, it produces an object containing all tables with schemas.
 */
export type TableSchemas<T extends Database.Service> = MergeTables<DatabaseTables<T>>;

/**
 * Given a list of tables with schema `T`, it produces an object containing all schemas.
 */
type MergeTables<T extends Database.Table[]> = IsArrayEmpty<T> extends false ? TableSchema<T[0]> & MergeTables<ArrayRest<T>> : {};

/**
 * Given a database table `T`, it produces an object containing the table schema.
 */
type TableSchema<T> = T extends { name: infer N; schema: infer S }
  ? N extends string
    ? S extends Database.Schema
      ? { [P in N]: S }
      : {}
    : {}
  : {};
