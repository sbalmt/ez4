import type { Topic } from './contract';

/**
 * Topic client.
 */
export interface Client<T extends Topic.Message> {
  /**
   * Send a new JSON message to the topic.
   *
   * @param message Message object.
   */
  sendMessage(message: T): Promise<void>;
}
