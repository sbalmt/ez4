import type { Notification } from './contract.js';

/**
 * Notification client.
 */
export interface Client<T extends Notification.Message> {
  /**
   * Send a new JSON message notification.
   *
   * @param message Message object.
   */
  sendMessage(message: T): Promise<void>;
}
