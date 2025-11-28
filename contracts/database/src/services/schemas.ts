import type { ArrayRest, IsArrayEmpty } from '@ez4/utils';
import type { DatabaseTable, DatabaseTables } from './table';
import type { Database } from './contract';

/**
 * Table schema.
 */
export interface TableSchema {}

/**
 * Given a database service `T`, it produces an object containing all tables with schemas.
 */
export type TableSchemas<T extends Database.Service> = MergeTables<DatabaseTables<T>>;

/**
 * Given a list of tables with schema `T`, it produces an object containing all schemas.
 */
type MergeTables<T extends DatabaseTable<TableSchema>[]> =
  IsArrayEmpty<T> extends false ? ExtractSchema<T[0]> & MergeTables<ArrayRest<T>> : {};

/**
 * Given a database table `T`, it produces an object containing the table schema.
 */
type ExtractSchema<T> = T extends { name: infer N; schema: infer S }
  ? N extends string
    ? S extends TableSchema
      ? { [P in N]: S }
      : {}
    : {}
  : {};
