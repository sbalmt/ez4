import type { Service } from '@ez4/common';
import type { QueueIncomingRequest, QueueMessage } from './message.js';
import type { QueueSubscription } from './subscription.js';
import type { QueueHandler } from './handler.js';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Queue service.
 */
export namespace Queue {
  export type Message = QueueMessage;

  export type Handler<T extends Message> = QueueHandler<T>;

  export type Incoming<T extends Message> = QueueIncomingRequest<T>;

  export type Subscription<T extends Message> = QueueSubscription<T>;

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message> implements Service.Provider {
    /**
     * All expected subscriptions.
     */
    abstract subscriptions: QueueSubscription<T>[];

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
}
