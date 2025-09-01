import type { ParametersMode } from './parameters';
import type { TransactionMode } from './transaction';
import type { InsensitiveMode } from './insensitive';
import type { PaginationMode } from './pagination';
import type { OrderMode } from './order';
import type { Database } from './database';

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
   * Get the insensitive mode from the given database engine.
   */
  export type GetInsensitiveMode<E extends DatabaseEngine> = E extends { insensitiveMode: infer M } ? M : never;

  /**
   * Get the pagination mode from the given database engine.
   */
  export type GetPaginationMode<E extends DatabaseEngine> = E extends { paginationMode: infer M } ? M : never;

  /**
   * Get the order mode from the given database service.
   */
  export type GetOrderMode<T extends Database.Service> = T['engine'] extends { orderMode: infer M } ? M : never;
}
