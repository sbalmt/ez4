import type { ArrayRest, IsArrayEmpty, IsAny } from '@ez4/utils';
import type { Database } from './database.js';

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
 * Given a database service `T`, it returns a map containing all its tables and schemas.
 */
export type TableSchemas<T extends Database.Service<any>> = MergeTables<ServiceTables<T>>;

/**
 * Given a database service `T`, it returns all its table types.
 */
type ServiceTables<T> = T extends { tables: infer U } ? U : [];

/**
 * Given a list of database tables `T`, it returns an object containing all table names and schemas.
 */
type MergeTables<T extends Database.Table[]> =
  IsArrayEmpty<T> extends true ? {} : TableRecord<T[0]> & MergeTables<ArrayRest<T>>;

/**
 * Given a database table `T`, it returns a table record containing its `name` and `schema`.
 */
type TableRecord<T> = T extends { name: infer N; schema: infer S }
  ? N extends string
    ? { [P in N]: S }
    : {}
  : {};
