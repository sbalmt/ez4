import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';
import type { Client } from './client.js';

/**
 * Provide all contracts for a self-managed Queue service.
 */
export namespace Queue {
  /**
   * Definition of a message.
   */
  export interface Message {}

  /**
   * Incoming request.
   */
  export type Incoming<T extends Message> = {
    /**
     * Request Id.
     */
    requestId: string;

    /**
     * Message payload.
     */
    message: T;
  };

  /**
   * Incoming request handler.
   */
  export type Handler<T extends Message> = (
    request: T,
    context: Service.Context<Service<any>>
  ) => Promise<void> | void;

  /**
   * Queue subscription.
   */
  export interface Subscription<T extends Message = Message> {
    /**
     * Subscription handler.
     *
     * @param request Incoming request.
     * @param context Handler context.
     */
    handler: Handler<Incoming<T>>;

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
  export declare abstract class Service<T extends Message = Message> implements Service.Provider {
    /**
     * All expected subscriptions.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * Message schema.
     */
    schema: T;

    /**
     * Max acknowledge time (in seconds) for the handler.
     */
    timeout?: number;

    /**
     * Max retention time (in minutes) for all messages in the queue.
     */
    retention?: number;

    /**
     * Max delay time (in seconds) for the handler to see messages.
     */
    delay?: number;

    /**
     * Service client.
     */
    client: Client<T>;
  }
}
