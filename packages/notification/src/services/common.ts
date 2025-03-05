import type { Service } from '@ez4/common';
import type { Notification } from './contract.js';

/**
 * Notification message.
 */
export interface NotificationMessage {}

/**
 * Incoming message.
 */
export type NotificationIncoming<T extends NotificationMessage> = {
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
export type SubscriptionListener<T extends NotificationMessage> = (
  event: Service.Event<NotificationIncoming<T>>,
  context: Service.Context<Notification.Service<any> | Notification.Import<any>>
) => Promise<void> | void;

/**
 * Message handler.
 */
export type SubscriptionHandler<T extends NotificationMessage> = (
  request: NotificationIncoming<T>,
  context: Service.Context<Notification.Service<any> | Notification.Import<any>>
) => Promise<void> | void;
