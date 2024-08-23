import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';

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
     * Message payload.
     */
    message: T;

    /**
     * Request Id.
     */
    requestId: string;
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

  /**
   * Queue client.
   */
  export interface Client<T extends Queue.Message> {
    /**
     * Send a new JSON message to the queue.
     *
     * @param message Message object.
     */
    sendMessage(message: T): Promise<void>;

    /**
     * Receive JSON messages from the queue.
     *
     * @param options Receive options.
     * @returns Returns a list containing zero or more messages.
     */
    receiveMessage(options?: ReceiveOptions): Promise<T[]>;
  }

  /**
   * Options for receiving messages with queue client.
   */
  export type ReceiveOptions = {
    /**
     * Max amount of messages.
     */
    maxMessages?: number;

    /**
     * Max wait time (in seconds) for messages.
     */
    maxWait?: number;
  };
}
