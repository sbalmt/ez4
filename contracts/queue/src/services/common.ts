import type { Service } from '@ez4/common';
import type { Queue } from './contract';

/**
 * Queue message.
 */
export interface QueueMessage {}

/**
 * Queue FIFO mode options.
 */
export interface QueueFifoMode<T extends QueueMessage> {
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
 * Queue dead-letter configuration.
 */
export interface QueueDeadLetter {
  /**
   * Maximum retention time (in minutes) for all messages in the dead-letter queue.
   */
  retention?: number;

  /**
   * Maximum retry attempts for the message before it fails.
   */
  maxRetries: number;
}

/**
 * Incoming message.
 */
export type QueueIncoming<T extends QueueMessage> = QueueRequest & {
  /**
   * Message payload.
   */
  message: T;
};

/**
 * Incoming request.
 */
export type QueueRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
};

/**
 * Message listener.
 */
export type SubscriptionListener<T extends QueueMessage> = (
  event: Service.AnyEvent<QueueIncoming<T>>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type SubscriptionHandler<T extends QueueMessage> = (
  request: QueueIncoming<T>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
