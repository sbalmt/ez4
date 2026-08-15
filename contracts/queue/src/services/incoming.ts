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

  /**
   * Retry the incoming message using the given retry options.
   *
   * **IMPORTANT**: If the retry attempts exceed the maximum number of attempts
   * configured in the dead-letter, the message is moved to the dead-letter instead.
   *
   * @param options Retry options.
   */
  readonly retry: (options?: QueueRetryOptions) => Promise<void>;
};

export type QueueRetryOptions = {
  /**
   * Optional delay time (in seconds) for making the message available.
   * If no delay is specified, the default backoff configuration for the queue is used.
   */
  delay?: number;
};
