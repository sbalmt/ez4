import type { Service } from '@ez4/common';
import type { Queue } from './contract';

/**
 * Queue message.
 */
export interface QueueMessage {}

/**
 * Incoming message.
 */
export type QueueIncoming<T extends QueueMessage> = QueueRequest & {
  /**
   * Message payload.
   */
  readonly message: T;
};

/**
 * Incoming request.
 */
export type QueueRequest = {
  /**
   * Request tracking Id.
   */
  readonly requestId: string;
};

/**
 * Queue subscription listener.
 */
export type QueueSubscriptionListener<T extends QueueMessage> = (
  event: Service.AnyEvent<QueueIncoming<T>>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;

/**
 * Queue subscription handler.
 */
export type QueueSubscriptionHandler<T extends QueueMessage> = (
  request: QueueIncoming<T>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
