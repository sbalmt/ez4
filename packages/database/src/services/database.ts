import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';
import type { StreamChange } from './streams.js';
import type { DatabaseEngine } from './engine.js';
import type { Client } from './client.js';

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
  export type Indexes = {};

  /**
   * Incoming stream event.
   */
  export type Incoming<T extends Schema> = StreamChange<
    T & {
      /**
       * Request tracking Id.
       */
      requestId: string;
    }
  >;

  /**
   * Stream listener.
   */
  export type Listener<T extends Schema> = (
    event: Service.Event<Incoming<T>>,
    context: Service.Context<Database.Service>
  ) => Promise<void> | void;

  /**
   * Stream handler.
   */
  export type Handler<T extends Schema> = (request: Incoming<T>, context: Service.Context<Database.Service>) => Promise<void> | void;

  /**
   * Service event.
   */
  export type ServiceEvent<T extends Schema = Schema> = Service.Event<Incoming<T>>;

  /**
   * Service engine.
   */
  export type Engine = DatabaseEngine;

  /**
   * Table stream.
   */
  export interface Stream<T extends Schema = Schema> {
    /**
     * Stream listener.
     */
    listener?: Listener<T>;

    /**
     * Stream handler.
     */
    handler: Handler<T>;

    /**
     * Variables associated to the handler.
     */
    variables?: LinkedVariables;

    /**
     * Log retention (in days) for the handler.
     */
    logRetention?: number;

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
    indexes: Indexes;

    /**
     * Table stream configuration.
     */
    stream?: Stream<T>;
  }

  /**
   * Database service.
   */
  export declare abstract class Service implements Service.Provider {
    /**
     * Determines which database engine to use.
     * Check the provider package to know all the possible values.
     */
    abstract engine: Engine;

    /**
     * Describe all available tables for the service.
     */
    abstract tables: Table<any>[];

    /**
     * Service client.
     */
    client: Client<Service>;
  }
}
