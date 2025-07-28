import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Client } from './client.js';

import type {
  QueueMessage,
  QueueRequest,
  QueueIncoming,
  SubscriptionHandler,
  SubscriptionListener,
  QueueFifoMode,
  QueueDeadLetter
} from './common.js';

/**
 * Provide all contracts for a self-managed queue service.
 */
export namespace Queue {
  export type Message = QueueMessage;
  export type Request = QueueRequest;
  export type DeadLetter = QueueDeadLetter;

  export type FifoMode<T extends Message> = QueueFifoMode<T>;
  export type Incoming<T extends Message> = QueueIncoming<T>;

  export type Listener<T extends Message> = SubscriptionListener<T>;
  export type Handler<T extends Message> = SubscriptionHandler<T>;

  export type ServiceEvent<T extends Message = Message> =
    | CommonService.BeginEvent<Request>
    | CommonService.ReadyEvent<Incoming<T>>
    | CommonService.ErrorEvent<Request | Incoming<T>>
    | CommonService.EndEvent<Request>;

  /**
   * Queue subscription.
   */
  export interface Subscription<T extends Message> {
    /**
     * Subscription listener.
     */
    listener?: Listener<T>;

    /**
     * Subscription handler.
     */
    handler: Handler<T>;

    /**
     * Maximum number of concurrent lambda handlers.
     */
    concurrency?: number;

    /**
     * Maximum number of messages per handler invocation.
     */
    batch?: number;

    /**
     * Variables associated to the subscription.
     */
    variables?: LinkedVariables;

    /**
     * Log retention (in days) for the handler.
     */
    logRetention?: number;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message> implements CommonService.Provider {
    /**
     * All subscriptions associated to the queue.
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
     * Enable and configure the dead-letter queue options.
     */
    deadLetter?: DeadLetter;

    /**
     * Maximum acknowledge time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Maximum retention time (in minutes) for all messages in the queue.
     */
    retention?: number;

    /**
     * Maximum wait time (in seconds) for receiving messages.
     */
    polling?: number;

    /**
     * Maximum delay time (in seconds) for making messages available.
     */
    delay?: number;

    /**
     * Service client.
     */
    client: Client<Service<T>>;
  }

  /**
   * Imported queue service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * Imported queue reference.
     */
    reference: T;

    /**
     * All subscriptions attached to the imported queue.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported FIFO mode options (do not replace).
     */
    fifoMode: T['fifoMode'];

    /**
     * Imported maximum acknowledge time (do not replace).
     */
    timeout: T['timeout'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
