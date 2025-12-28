import type { TopicMessage } from './message';
import type { TopicRequest } from './request';

/**
 * Incoming message.
 */
export type TopicIncoming<T extends TopicMessage> = TopicRequest & {
  /**
   * Message payload.
   */
  readonly message: T;
};
