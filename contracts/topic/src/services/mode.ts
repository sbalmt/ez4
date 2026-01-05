import type { TopicMessage } from './message';

/**
 * Topic FIFO mode options.
 */
export interface TopicFifoMode<T extends TopicMessage> {
  /**
   * Name of the message deduplication field.
   */
  readonly uniqueId?: keyof T;

  /**
   * Name of the message group id field.
   */
  readonly groupId: keyof T;
}
