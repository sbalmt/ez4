import type { Service } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { StreamChange } from './streams.js';
import type { TableTypes } from './table.js';
import type { Client } from './client.js';
import type { Index } from './indexes.js';

/**
 * Given a database service `T`, it returns all its table.
 */
export type DatabaseTables<T> = T extends { tables: infer U } ? U : [];

/**
 * Provide all contracts for a self-managed database service.
 */
export namespace Database {
  /**
   * Table schema.
   */
  export interface Schema {}

  /**
   * Table relations.
   */
  export interface Relations {}

  /**
   * Table indexes.
   */
  export type Indexes<T extends Schema = Schema> = {
    [P in keyof T]?: Index;
  };

  /**
   * Incoming stream event.
   */
  export type Incoming<T extends Schema> = StreamChange<T> & {
    /**
     * Request tracking Id.
     */
    requestId: string;
  };

  /**
   * Incoming stream handler.
   */
  export type Handler<T extends Schema = Schema> = (
    request: Incoming<T> | StreamChange<T>,
    context: Service.Context<Service>
  ) => Promise<void> | void;

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
    handler: Handler<T>;

    /**
     * Variables associated to the handler.
     */
    variables?: LinkedVariables;

    /**
     * Max execution time (in seconds) for the handler.
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
     * Table relations.
     */
    relations?: Relations;

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
     * Determines which database engine to use.
     * Check the provider package to know all the possible values.
     */
    abstract engine: string;

    /**
     * Describe all available tables for the service.
     */
    abstract tables: TableTypes<T>[];

    /**
     * Service client.
     */
    client: Client<Service<T>>;
  }
}
