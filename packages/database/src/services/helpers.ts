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
 * Given a database service `T`, it returns all its table types.
 */
export type DatabaseTables<T> = T extends { tables: infer U } ? U : [];
