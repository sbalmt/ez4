import type { TableClients } from './table.js';
import type { Transaction } from './transaction.js';
import type { Database } from './database.js';

/**
 * Database client.
 */
export type Client<T extends Database.Service<any>> = TableClients<T> & {
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
   * @param operations Transaction operations.
   */
  transaction<O extends Transaction.WriteOperations<T>>(operations: O): Promise<void>;
};
