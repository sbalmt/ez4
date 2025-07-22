import type { Service as CommonService } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { Queue } from '@ez4/queue';
import type { Client } from './client.js';

import type {
  NotificationMessage,
  NotificationIncoming,
  SubscriptionHandler,
  SubscriptionListener,
  NotificationFifoMode
} from './common.js';

/**
 * Provide all contracts for a self-managed notification service.
 */
export namespace Notification {
  export type Message = NotificationMessage;

  export type FifoMode<T extends Message> = NotificationFifoMode<T>;
  export type Incoming<T extends Message> = NotificationIncoming<T>;

  export type Listener<T extends Message> = SubscriptionListener<T>;
  export type Handler<T extends Message> = SubscriptionHandler<T>;

  export type Subscription<T extends Message> = LambdaSubscription<T> | QueueSubscription<T>;

  export type ServiceEvent<T extends Message = Message> = CommonService.Event<Incoming<T>>;

  /**
   * Queue subscription.
   */
  export interface QueueSubscription<T extends Message> {
    /**
     * Reference to the queue service.
     */
    service: Queue.Service<T>;
  }

  /**
   * Lambda subscription.
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
   * Notification service.
   */
  export declare abstract class Service<T extends Message> implements CommonService.Provider {
    /**
     * All subscriptions associated to the notification.
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
   * Imported notification service.
   */
  export declare abstract class Import<T extends Service<any>> implements CommonService.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * All subscriptions attached to the imported notification.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported notification reference.
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
