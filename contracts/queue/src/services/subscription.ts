import type { LinkedVariables } from '@ez4/project/library';
import type { QueueMessage, QueueSubscriptionListener, QueueSubscriptionHandler } from './common';

/**
 * Queue subscription.
 */
export interface QueueSubscription<T extends QueueMessage> {
  /**
   * Subscription listener.
   */
  readonly listener?: QueueSubscriptionListener<T>;

  /**
   * Subscription handler.
   */
  readonly handler: QueueSubscriptionHandler<T>;

  /**
   * Maximum number of concurrent lambda handlers.
   */
  readonly concurrency?: number;

  /**
   * Maximum number of messages per handler invocation.
   */
  readonly batch?: number;

  /**
   * Variables associated to the subscription.
   */
  readonly variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Amount of memory available for the handler.
   */
  readonly memory?: number;
}
