import type { AnyObject } from '@ez4/utils';
import type { ParametersMode, TransactionMode, InsensitiveMode, PaginationMode, OrderMode, LockMode, StreamMode } from '../types/mode';
import type { Database } from './contract';

/**
 * Database engine.
 */
export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  streamMode: StreamMode;
  orderMode: OrderMode;
  lockMode: LockMode;
  options: AnyObject;
  name: string;
};

/**
 * Engine utils.
 */
export namespace EngineUtils {
  /**
   * Get the parameters mode from the given database service.
   */
  export type GetParametersMode<T extends Database.Service<any>> = T['engine'] extends { parametersMode: infer M } ? M : never;

  /**
   * Get the transaction mode from the given database service.
   */
  export type GetTransactionMode<T extends Database.Service<any>> = T['engine'] extends { transactionMode: infer M } ? M : never;

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
  export type GetOrderMode<T extends Database.Service<any>> = T['engine'] extends { orderMode: infer M } ? M : never;

  /**
   * Get the lock mode from the given database service.
   */
  export type GetLockMode<T extends Database.Service<any>> = T['engine'] extends { lockMode: infer M } ? M : never;
}
