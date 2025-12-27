import type { ServiceArchitecture, ServiceRuntime } from '@ez4/common';
import type { LinkedVariables } from '@ez4/project/library';
import type { QueueMessage, QueueSubscriptionListener, QueueSubscriptionHandler } from './common';

/**
 * Queue subscription.
 */
export interface QueueSubscription<T extends QueueMessage> {
  /**
   * Life-cycle listener function for the subscription.
   */
  readonly listener?: QueueSubscriptionListener<T>;

  /**
   * Entry-point handler function for the subscription.
   */
  readonly handler: QueueSubscriptionHandler<T>;

  /**
   * Maximum number of concurrent executions handlers.
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
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ServiceArchitecture;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: ServiceRuntime;
}
