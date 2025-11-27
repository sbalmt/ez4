import type { QueueMessage } from './common';

/**
 * Queue FIFO mode options.
 */
export interface QueueFifoMode<T extends QueueMessage> {
  /**
   * Name of the message deduplication field.
   */
  uniqueId?: keyof T;

  /**
   * Name of the message group id field.
   */
  groupId: keyof T;
}
