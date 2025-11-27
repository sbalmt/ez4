import type { TopicMessage } from './common';

/**
 * Topic FIFO mode options.
 */
export interface TopicFifoMode<T extends TopicMessage> {
  /**
   * Name of the message deduplication field.
   */
  uniqueId?: keyof T;

  /**
   * Name of the message group id field.
   */
  groupId: keyof T;
}
