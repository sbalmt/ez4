import type { ParametersUtils } from './parameters';
import type { TransactionUtils } from './transaction';
import type { TableClients } from './table';
import type { Database } from './database';

/**
 * Database client.
 */
export type Client<T extends Database.Service> = TableClients<T> & {
  /**
   * Prepare and execute the given query.
   *
   * @param query Query statement.
   * @param parameters Parameters in use by the given query.
   * @returns Returns the results for the given query.
   */
  rawQuery(query: string, parameters?: ParametersUtils.Type<T>): Promise<Record<string, unknown>[]>;

  /**
   * Prepare and execute the given transaction.
   *
   * @param operation Transaction operation.
   * @returns Returns the transaction result if the given transaction is interactive.
   */
  transaction<O extends TransactionUtils.Type<T, R>, R>(operation: O): Promise<TransactionUtils.Result<O>>;
};
