import type { Transaction } from './transaction.js';
import type { TableClients } from './table.js';
import type { Database } from './database.js';

/**
 * Database client.
 */
export type Client<T extends Database.Service> = TableClients<T> & {
  /**
   * Prepare and execute the given query.
   *
   * @param query Query statement.
   * @param values Optional values to prepare the query.
   * @returns Returns the results for the given query.
   */
  rawQuery(query: string, values?: unknown[]): Promise<Record<string, unknown>[]>;

  /**
   * Prepare and execute the given transaction.
   *
   * @param operation Transaction operation.
   * @returns Returns the transaction result if the given transaction is interactive.
   */
  transaction<O extends Transaction.Operation<T, R>, R>(operation: O): Promise<Transaction.Result<O>>;
};
