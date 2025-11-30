import type { QueueMessage } from './common';

/**
 * Queue FIFO mode options.
 */
export interface QueueFifoMode<T extends QueueMessage> {
  /**
   * Name of the message deduplication field.
   */
  readonly uniqueId?: keyof T;

  /**
   * Name of the message group id field.
   */
  readonly groupId: keyof T;
}
