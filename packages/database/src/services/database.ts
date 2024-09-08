import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { StreamChange } from './streams.js';
import type { TableTypes } from './helpers.js';
import type { Client } from './client.js';
import type { Index } from './indexes.js';

/**
 * Provide all contracts for a self-managed database service.
 */
export namespace Database {
  /**
   * Table schema.
   */
  export interface Schema {}

  /**
   * Table indexes.
   */
  export type Indexes<T extends Schema = Schema> = {
    [P in `${string & keyof T}:${string & keyof T}` | keyof T]?: Index;
  };

  /**
   * Table stream.
   */
  export interface Stream<T extends Schema = Schema> {
    /**
     * Stream handler.
     *
     * @param change Stream change.
     * @param context Handler context.
     */
    handler: (
      change: StreamChange<T>,
      context: Service.Context<Service<any>>
    ) => void | Promise<void>;

    /**
     * Variables associated to the route.
     */
    variables?: LinkedVariables;

    /**
     * Max route execution time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

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

    /**
     * Table indexes.
     */
    indexes: Indexes<T>;

    /**
     * Table stream configuration.
     */
    stream?: Stream<T>;
  }

  /**
   * Database service.
   */
  export declare abstract class Service<T extends Schema[] = [Schema]> implements Service.Provider {
    /**
     * All service tables.
     */
    abstract tables: TableTypes<T>[];

    /**
     * Service client.
     */
    client: Client<Service<T>>;
  }
}
