import type { LinkedVariables } from '@ez4/project/library';
import type { QueueMessage, QueueSubscriptionListener, QueueSubscriptionHandler } from './common';

/**
 * Queue subscription.
 */
export interface QueueSubscription<T extends QueueMessage> {
  /**
   * Subscription listener.
   */
  listener?: QueueSubscriptionListener<T>;

  /**
   * Subscription handler.
   */
  handler: QueueSubscriptionHandler<T>;

  /**
   * Maximum number of concurrent lambda handlers.
   */
  concurrency?: number;

  /**
   * Maximum number of messages per handler invocation.
   */
  batch?: number;

  /**
   * Variables associated to the subscription.
   */
  variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  logRetention?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
