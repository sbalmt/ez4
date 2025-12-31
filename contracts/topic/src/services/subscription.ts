import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { LinkedVariables } from '@ez4/project/library';
import type { Queue } from '@ez4/queue';
import type { TopicSubscriptionListener } from './listener';
import type { TopicSubscriptionHandler } from './handler';
import type { TopicMessage } from './message';

/**
 * Queue subscription for the topic.
 */
export interface TopicQueueSubscription<T extends TopicMessage> {
  /**
   * Reference to the queue service.
   */
  readonly service: {
    readonly reference: Queue.Service<T>;
  };
}

/**
 * Lambda subscription for the topic.
 */
export interface TopicLambdaSubscription<T extends TopicMessage> {
  /**
   * Life-cycle listener function for the subscription.
   */
  readonly listener?: TopicSubscriptionListener<T>;

  /**
   * Entry-point handler function for the subscription.
   */
  readonly handler: TopicSubscriptionHandler<T>;

  /**
   * Environment variables associated to the subscription.
   */
  readonly variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  readonly logRetention?: number;

  /**
   * Maximum execution time (in seconds) for the handler.
   */
  readonly timeout?: number;

  /**
   * Amount of memory available (in megabytes) for the handler.
   */
  readonly memory?: number;

  /**
   * Architecture for the handler.
   */
  readonly architecture?: ArchitectureType;

  /**
   * Runtime for the handler.
   */
  readonly runtime?: RuntimeType;
}
