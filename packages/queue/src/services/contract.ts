import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';
import type { Client } from './client.js';

import type {
  QueueMessage,
  QueueIncoming,
  SubscriptionHandler,
  SubscriptionListener
} from './common.js';

/**
 * Provide all contracts for a self-managed queue service.
 */
export namespace Queue {
  export type Message = QueueMessage;

  export type Incoming<T extends Message> = QueueIncoming<T>;

  export type Listener<T extends Message> = SubscriptionListener<T>;
  export type Handler<T extends Message> = SubscriptionHandler<T>;

  export type ServiceEvent<T extends Message = {}> = Service.Event<Incoming<T>>;

  /**
   * Queue subscription.
   */
  export interface Subscription<T extends Message> {
    /**
     * Target listener.
     */
    listener?: Listener<T>;

    /**
     * Subscription handler.
     */
    handler: Handler<T>;

    /**
     * Maximum number of concurrent lambdas.
     */
    concurrency?: number;

    /**
     * Variables associated to the subscription.
     */
    variables?: LinkedVariables;

    /**
     * Amount of memory available for the handler.
     */
    memory?: number;
  }

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message> implements Service.Provider {
    /**
     * All subscriptions associated to the queue.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    schema: T;

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
    client: Client<T>;
  }

  /**
   * Imported queue service.
   */
  export declare abstract class Import<T extends Service<any>> implements Service.Provider {
    /**
     * Name of the imported project defined in the project options file.
     */
    abstract project: string;

    /**
     * All subscriptions attached to the imported queue.
     */
    subscriptions: Subscription<T['schema']>[];

    /**
     * Imported queue reference.
     */
    reference: T;

    /**
     * Imported message schema (do not replace).
     */
    schema: T['schema'];

    /**
     * Imported maximum acknowledge time (do not replace).
     */
    timeout: T['timeout'];

    /**
     * Imported maximum wait time for receiving messages (do not replace).
     */
    polling: T['polling'];

    /**
     * Imported service client (do not replace).
     */
    client: T['client'];
  }
}
