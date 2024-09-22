import type { QueueMessage } from './message.js';

/**
 * Incoming queue message.
 */
export type QueueIncoming<T extends QueueMessage> = {
  /**
   * Request Id.
   */
  requestId: string;

  /**
   * Message payload.
   */
  message: T;
};
