import type { QueueMessage } from './message';

/**
 * FIFO queue mode options.
 */
export interface QueueFifoMode<T extends QueueMessage> {
  /**
   * Name of the message deduplication field.
   */
  readonly uniqueId?: keyof T;

  /**
   * Name of the message group field.
   */
  readonly groupId: keyof T;
}
