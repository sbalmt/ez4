import type { OrderMode } from '../types/mode';
import type { Order } from '../types/order';
import type { DecomposeIndexName } from './indexes';
import type { TableMetadata } from './table';
import type { Database } from './contract';

/**
 * Order mode utils.
 */
export namespace OrderModeUtils {
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
