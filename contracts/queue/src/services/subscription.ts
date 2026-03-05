import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { QueueSubscriptionListener } from './listener';
import type { QueueSubscriptionHandler } from './handler';
import type { QueueMessage } from './message';

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
   * Maximum number of messages per handler invocation.
   */
  readonly batch?: number;

  /**
   * Maximum number of concurrent executions handlers.
   */
  readonly concurrency?: number;

  /**
   * Variables associated to the subscription.
   */
  readonly variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Log level for the handler.
   */
  readonly logLevel?: LogLevel;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: RuntimeType;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Additional resources files for the bundler.
   */
  readonly files?: string[];

  /**
   * Determines whether or not VPC is enabled for the subscription.
   */
  readonly vpc?: boolean;
}
