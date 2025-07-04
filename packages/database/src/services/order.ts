import type { DecomposeIndexName } from './indexes.js';
import type { TableMetadata } from './table.js';
import type { Database } from './database.js';

/**
 * Query order types.
 */
export const enum Order {
  Asc = 'asc',
  Desc = 'desc'
}

/**
 * Order mode.
 */
export const enum OrderMode {
  IndexColumns = 'index',
  AnyColumns = 'any'
}

/**
 * Order utils.
 */
export namespace OrderUtils {
  /**
   * Order input for index columns.
   */
  export type IndexInput<I extends Database.Indexes> = {
    [P in DecomposeIndexName<keyof I>]?: Order;
  };

  /**
   * Order input for any columns.
   */
  export type AnyInput<T extends Database.Schema> = {
    [P in keyof T]?: Order;
  };

  /**
   * Order input type based on the table metadata.
   */
  export type Input<T extends TableMetadata> = T['engine']['orderMode'] extends OrderMode.IndexColumns
    ? IndexInput<T['indexes']>
    : AnyInput<T['schema']>;
}
