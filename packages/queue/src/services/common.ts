import type { Service } from '@ez4/common';
import type { Queue } from './contract.js';

/**
 * Queue message.
 */
export interface QueueMessage {}

/**
 * Incoming message.
 */
export type QueueIncoming<T extends QueueMessage> = {
  /**
   * Request Id.
   */
  requestId: string;

  /**
   * Message payload.
   */
  message: T;
};

/**
 * Message listener.
 */
export type SubscriptionListener<T extends QueueMessage> = (
  event: Service.Event<QueueIncoming<T>>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type SubscriptionHandler<T extends QueueMessage> = (
  request: QueueIncoming<T>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
