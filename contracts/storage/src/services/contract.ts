import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { BucketEvent, BucketHandler, BucketIncoming, BucketListener, BucketRequest } from './common';
import type { BucketEvents } from './events';
import type { BucketCors } from './cors';
import type { Client } from './client';

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

  export type Events = BucketEvents;

  export type ServiceEvent =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming>
    | CommonService.DoneEvent<Incoming>
    | CommonService.ErrorEvent<Request | Incoming>
    | CommonService.EndEvent<Request>;

  /**
   * Bucket Events definition.
   */
  export type UseEvents<T extends Events> = T;

  /**
   * Bucket CORS definition.
   */
  export type UseCors<T extends Cors> = T;

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
