import type { Service } from '@ez4/common';

/**
 * Provide all contracts for a self-managed Database service.
 */
export namespace Database {
  /**
   * Table schema.
   */
  export interface Schema {}

  /**
   * Database table.
   */
  export interface Table<T extends Schema = Schema> {
    /**
     * Table name.
     */
    name: string;

    /**
     * Table schema.
     */
    schema: T;
  }

  /**
   * Database service.
   */
  export declare abstract class Service<T extends Schema = Schema>
    implements Service.Provider<Client<T>>
  {
    /**
     * Service name.
     */
    abstract name: string;

    /**
     * All service tables.
     */
    abstract tables: Table<T>[];

    /**
     * Service client (used only for type inference).
     */
    client: Client<T>;
  }

  /**
   * Database client.
   */
  export interface Client<_T extends Database.Schema> {
    /**
     * Prepare and execute the given query.
     *
     * @param query Query statement.
     * @param values Optional values to prepare query.
     * @returns Returns the result for the given query.
     */
    rawQuery(query: string, values?: unknown[]): Promise<Record<string, unknown>[]>;
  }
}
