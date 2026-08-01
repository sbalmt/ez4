import type { TopicRequest } from './request';
import type { TopicEvent } from './event';

/**
 * Incoming event.
 */
export type TopicIncoming<T extends TopicEvent> = TopicRequest & {
  /**
   * Event payload.
   */
  readonly event: T;
};
