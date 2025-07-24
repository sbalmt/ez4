import type { Service } from '@ez4/common';
import type { Notification } from './contract.js';

/**
 * Notification message.
 */
export interface NotificationMessage {}

/**
 * Notification FIFO mode options.
 */
export interface NotificationFifoMode<T extends NotificationMessage> {
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
export type NotificationIncoming<T extends NotificationMessage> = NotificationRequest & {
  /**
   * Message payload.
   */
  message: T;
};

/**
 * Incoming request.
 */
export type NotificationRequest = {
  /**
   * Request tracking Id.
   */
  requestId: string;
};

/**
 * Message listener.
 */
export type SubscriptionListener<T extends NotificationMessage> = (
  event: Service.AnyEvent<NotificationIncoming<T>>,
  context: Service.Context<Notification.Service<any> | Notification.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type SubscriptionHandler<T extends NotificationMessage> = (
  request: NotificationIncoming<T>,
  context: Service.Context<Notification.Service<any> | Notification.Import<any>>
) => Promise<void> | void;
