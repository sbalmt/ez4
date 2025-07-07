import type { Queue } from './contract.js';

/**
 * Queue client.
 */
export interface Client<T extends Queue.Service<any>> {
  /**
   * Send a new JSON message to the queue.
   *
   * @param message Message object.
   * @param options Send options.
   */
  sendMessage(message: T['schema'], options?: SendOptions<T>): Promise<void>;

  /**
   * Receive JSON messages from the queue.
   *
   * @param options Receive options.
   * @returns Returns a list containing zero or more messages.
   */
  receiveMessage(options?: ReceiveOptions): Promise<T['schema'][]>;
}

/**
 * Options for receiving messages with queue client.
 */
export type ReceiveOptions = {
  /**
   * Maximum amount of messages.
   */
  messages?: number;

  /**
   * Maximum wait time (in seconds) for receiving messages.
   */
  polling?: number;
};

/**
 * Options for sending messages with queue client.
 */
export type SendOptions<T extends Queue.Service<any>> = undefined extends T['fifoMode'] ? StandardSendOptions : never;

/**
 * Options for sending messages with standard queue client.
 */
export type StandardSendOptions = {
  /**
   * Maximum delay time (in seconds) for making the message available.
   */
  delay?: number;
};
