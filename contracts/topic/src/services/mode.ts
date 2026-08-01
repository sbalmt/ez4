import type { TopicEvent } from './event';

/**
 * Topic FIFO mode options.
 */
export interface TopicFifoMode<T extends TopicEvent> {
  /**
   * Name of the event deduplication field.
   */
  readonly uniqueId?: keyof T;

  /**
   * Name of the event group Id field.
   */
  readonly groupId: keyof T;
}
