import type { Service } from '@ez4/common';
import type { Topic } from './contract';

/**
 * Topic message.
 */
export interface TopicMessage {}

/**
 * Incoming message.
 */
export type TopicIncoming<T extends TopicMessage> = TopicRequest & {
  /**
   * Message payload.
   */
  message: T;
};

/**
 * Incoming request.
 */
export type TopicRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
};

/**
 * Message listener.
 */
export type TopicSubscriptionListener<T extends TopicMessage> = (
  event: Service.AnyEvent<TopicIncoming<T>>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type TopicSubscriptionHandler<T extends TopicMessage> = (
  request: TopicIncoming<T>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;
