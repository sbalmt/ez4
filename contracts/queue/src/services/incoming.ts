import type { QueueMessage } from './message';
import type { QueueRequest } from './request';

/**
 * Incoming message.
 */
export type QueueIncoming<T extends QueueMessage> = QueueRequest & {
  /**
   * Message payload.
   */
  readonly message: T;
};
