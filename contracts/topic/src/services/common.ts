import type { Service } from '@ez4/common';
import type { Topic } from './contract.js';

/**
 * Topic message.
 */
export interface TopicMessage {}

/**
 * Topic FIFO mode options.
 */
export interface TopicFifoMode<T extends TopicMessage> {
  /**
   * Name of the message deduplication field.
   */
  uniqueId?: keyof T;

  /**
   * Name of the message group id field.
   */
  groupId: keyof T;
}

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
export type SubscriptionListener<T extends TopicMessage> = (
  event: Service.AnyEvent<TopicIncoming<T>>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type SubscriptionHandler<T extends TopicMessage> = (
  request: TopicIncoming<T>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;
