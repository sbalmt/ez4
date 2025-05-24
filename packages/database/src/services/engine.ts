import type { ParametersMode } from './parameters.js';
import type { TransactionMode } from './transaction.js';
import type { PaginationMode } from './pagination.js';
import type { OrderMode } from './order.js';
import type { Database } from './database.js';
import type { TableMetadata } from './table.js';

/**
 * Database engine.
 */
export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  orderMode: OrderMode;
  name: string;
};

export const enum InsensitiveMode {
  Unsupported = 'unsupported',
  Enabled = 'enabled'
}

/**
 * Engine utils.
 */
export namespace EngineUtils {
  /**
   * Get the parameters mode from the given database service.
   */
  export type GetParametersMode<T extends Database.Service> = T['engine'] extends { parametersMode: infer M } ? M : never;

  /**
   * Get the transaction mode from the given database service.
   */
  export type GetTransactionMode<T extends Database.Service> = T['engine'] extends { transactionMode: infer M } ? M : never;

  /**
   * Get the pagination mode from the given table metadata.
   */
  export type GetPaginationMode<T extends TableMetadata> = T['engine'] extends { paginationMode: infer M } ? M : never;

  /**
   * Get the order mode from the given database service.
   */
  export type GetOrderMode<T extends Database.Service> = T['engine'] extends { orderMode: infer M } ? M : never;
}
