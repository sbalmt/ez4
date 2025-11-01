import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Queue } from '@ez4/queue';
import type { Client } from './client';

import type { TopicMessage, TopicRequest, TopicIncoming, TopicFifoMode, SubscriptionHandler, SubscriptionListener } from './common';

/**
 * Provide all contracts for a self-managed topic service.
 */
export namespace Topic {
  export type Message = TopicMessage;
  export type Request = TopicRequest;

  export type FifoMode<T extends Message> = TopicFifoMode<T>;
  export type Incoming<T extends Message> = TopicIncoming<T>;

  export type Listener<T extends Message> = SubscriptionListener<T>;
  export type Handler<T extends Message> = SubscriptionHandler<T>;

  export type Subscription<T extends Message> = LambdaSubscription<T> | QueueSubscription<T>;

  export type ServiceEvent<T extends Message = Message> =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming<T>>
    | CommonService.DoneEvent<Incoming<T>>
    | CommonService.ErrorEvent<Request | Incoming<T>>
    | CommonService.EndEvent<Request>;

  /**
   * Queue subscription for the topic.
   */
  export interface QueueSubscription<T extends Message> {
    /**
     * Reference to the queue service.
     */
    service: {
      reference: Queue.Service<T>;
    };
  }

  /**
   * Lambda subscription for the topic.
   */
  export interface LambdaSubscription<T extends Message> {
    /**
     * Subscription listener.
     */
    listener?: Listener<T>;

    /**
     * Subscription handler.
     */
    handler: Handler<T>;

    /**
     * Variables associated to the subscription.
     */
    variables?: LinkedVariables;

    /**
     * Log retention (in days) for the handler.
     */
    logRetention?: number;

    /**
     * Maximum execution time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

  /**
   * Topic service.
   */
  export declare abstract class Service<T extends Message> implements CommonService.Provider {
    /**
     * All subscriptions associated to the topic.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    schema: T;

    /**
     * Enable and configure the FIFO mode options.
     */
    fifoMode?: FifoMode<T>;

    /**
     * Service client.
     */
    client: Client<T>;
  }

  /**
   * Imported topic service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * All subscriptions attached to the imported topic.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported topic reference.
     */
    reference: T;

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    fifoMode: T['fifoMode'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
