import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Client } from './client';

import type { BucketCors, BucketEvent, BucketHandler, BucketIncoming, BucketListener, BucketRequest } from './common';

/**
 * Provide all contracts for a self-managed Bucket service.
 */
export namespace Bucket {
  export type Cors = BucketCors;

  export type Event = BucketEvent;

  export type Incoming = BucketIncoming<Event>;
  export type Request = BucketRequest;

  export type Listener = BucketListener<Event>;
  export type Handler = BucketHandler<Event>;

  export type ServiceEvent =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming>
    | CommonService.DoneEvent<Incoming>
    | CommonService.ErrorEvent<Request | Incoming>
    | CommonService.EndEvent<Request>;

  /**
   * Bucket events.
   */
  export interface Events {
    /**
     * Event listener.
     */
    listener?: Listener;

    /**
     * Event handler.
     */
    handler: Handler;

    /**
     * Path associated to the event.
     */
    path?: string;

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
   * Bucket service.
   */
  export declare abstract class Service implements CommonService.Provider {
    /**
     * Overwrite the global bucket name.
     */
    globalName?: string;

    /**
     * Specify a local path to synchronize with the storage.
     */
    localPath?: string;

    /**
     * Maximum amount of days an object is stored before its auto-deletion.
     */
    autoExpireDays?: number;

    /**
     * Bucket events.
     */
    events?: Events;

    /**
     * CORS configuration.
     */
    cors?: Cors;

    /**
     * Variables associated to all events.
     */
    variables?: LinkedVariables;

    /**
     * Service client.
     */
    client: Client;
  }
}
