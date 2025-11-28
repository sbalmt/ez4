import type { Service as CommonService } from '@ez4/common';
import type { TableStreamHandler, TableStreamIncoming, TableStreamListener, TableStreamRequest } from './common';
import type { DatabaseScalability } from './scalability';
import type { TableRelations } from './relations';
import type { DatabaseEngine } from './engine';
import type { TableIndexes } from './indexes';
import type { TableStream } from './streams';
import type { TableSchema } from './schemas';
import type { DatabaseTable } from './table';
import type { Client } from './client';

/**
 * Provide all contracts for a self-managed database service.
 */
export namespace Database {
  export type Schema = TableSchema;
  export type Relations = TableRelations;
  export type Indexes = TableIndexes;

  export type Incoming<T extends Schema> = TableStreamIncoming<T>;
  export type Request = TableStreamRequest;

  export type Listener<T extends Schema> = TableStreamListener<T>;
  export type Handler<T extends Schema> = TableStreamHandler<T>;

  export type Stream<T extends Schema = Schema> = TableStream<T>;
  export type Table<T extends Schema = Schema> = DatabaseTable<T>;

  export type Scalability = DatabaseScalability;
  export type Engine = DatabaseEngine;

  export type ServiceEvent<T extends Schema = Schema> =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming<T>>
    | CommonService.DoneEvent<Incoming<T>>
    | CommonService.ErrorEvent<Request | Incoming<T>>
    | CommonService.EndEvent<Request>;

  /**
   * Database Table definition.
   */
  export type UseTable<T extends DatabaseTable<any>> = T;

  /**
   * Database Engine definition.
   */
  export type UseEngine<T extends DatabaseEngine> = T;

  /**
   * Database Scalability definition.
   */
  export type UseScalability<T extends DatabaseScalability> = T;

  /**
   * Database service.
   */
  export declare abstract class Service implements CommonService.Provider {
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
     * Scalability configuration.
     */
    scalability: Scalability;

    /**
     * Service client.
     */
    client: Client<Service>;
  }
}
