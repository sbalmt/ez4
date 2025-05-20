import type { AnyObject } from '@ez4/utils';
import type { DecomposeIndexName } from './indexes.js';
import type { DatabaseEngine } from './engine.js';
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
   * Determines the order mode based on the given database service.
   */
  export type Input<T extends AnyObject, E extends DatabaseEngine> = E['orderMode'] extends OrderMode.AnyColumns
    ? AnyInput<T['schema']>
    : IndexInput<T['indexes']>;
}
