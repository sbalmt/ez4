import type { Database } from './database.js';

/**
 * Database engine.
 */
export type DatabaseEngine = {
  parametersMode: Engine.ParametersMode;
  transactionMode: Engine.TransactionMode;
  orderMode: Engine.OrderMode;
  name: string;
};

/**
 * Engine utils.
 */
export namespace Engine {
  /**
   * Transaction mode.
   */
  export const enum TransactionMode {
    Interactive = 'interactive',
    Static = 'static'
  }

  /**
   * Parameters mode.
   */
  export const enum ParametersMode {
    NameAndIndex = 'both',
    OnlyIndex = 'index'
  }

  /**
   * Order mode.
   */
  export const enum OrderMode {
    IndexColumns = 'index',
    AnyColumns = 'any'
  }

  /**
   * Get the parameters mode from the given database service.
   */
  export type GetParametersMode<T extends Database.Service> = T['engine'] extends { parametersMode: infer R } ? R : never;

  /**
   * Get the transaction mode from the given database service.
   */
  export type GetTransactionMode<T extends Database.Service> = T['engine'] extends { transactionMode: infer O } ? O : never;
}
