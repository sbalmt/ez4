import type { LinkedVariables } from '@ez4/project/library';
import type { Queue } from '@ez4/queue';
import type { TopicSubscriptionListener, TopicSubscriptionHandler, TopicMessage } from './common';

/**
 * Queue subscription for the topic.
 */
export interface TopicQueueSubscription<T extends TopicMessage> {
  /**
   * Reference to the queue service.
   */
  service: {
    reference: Queue.Service<T>;
  };
}

/**
 * Lambda subscription for the topic.
 */
export interface TopicLambdaSubscription<T extends TopicMessage> {
  /**
   * Subscription listener.
   */
  listener?: TopicSubscriptionListener<T>;

  /**
   * Subscription handler.
   */
  handler: TopicSubscriptionHandler<T>;

  /**
   * Variables associated to the subscription.
   */
  variables?: LinkedVariables;

  /**
   * Log retention (in days) for the handler.
   */
  logRetention?: number;

  /**
   * Maximum execution time (in seconds) for the handler.
   */
  timeout?: number;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
