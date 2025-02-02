import type { Queue } from './contract.js';

/**
 * Queue client.
 */
export interface Client<T extends Queue.Message> {
  /**
   * Send a new JSON message to the queue.
   *
   * @param message Message object.
   * @param options Send options.
   */
  sendMessage(message: T, options?: SendOptions): Promise<void>;

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
export type SendOptions = {
  /**
   * Maximum delay time (in seconds) for making the message available.
   */
  delay?: number;
};
