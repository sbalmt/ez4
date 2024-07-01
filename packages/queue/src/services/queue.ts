import type { LinkedVariables } from '@ez4/project';
import type { Service } from '@ez4/common';

/**
 * Provide all contracts for a self-managed Queue service.
 */
export namespace Queue {
  /**
   * Subscription message.
   */
  export interface Message {}

  /**
   * Queue subscription.
   */
  export interface Subscription<T extends Message = Message> {
    /**
     * Subscription handler.
     *
     * @param message Incoming message.
     * @param context Handler context.
     */
    handler: (message: T, context: Service.Context<Service<T>>) => void | Promise<void>;

    /**
     * Variables associated to the subscription.
     */
    variables?: LinkedVariables;
  }

  /**
   * Queue service.
   */
  export declare abstract class Service<T extends Message = Message>
    implements Service.Provider<Client<T>>
  {
    /**
     * Service name.
     */
    abstract name: string;

    /**
     * Message schema.
     */
    abstract schema: T;

    /**
     * All expected subscriptions.
     */
    abstract subscriptions: Subscription<T>[];

    /**
     * All variables associated to the subscriptions.
     */
    variables: LinkedVariables;

    /**
     * Service client (used only for type inference).
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
    receiveMessage(options?: ReceiveMessageOptions): Promise<T[]>;
  }

  /**
   * Options for receiving messages with the queue client.
   */
  export type ReceiveMessageOptions = {
    maxMessages?: number;
    maxWait?: number;
  };
}
