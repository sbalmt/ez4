import type { LinkedVariables } from '@ez4/project/library';
import type { Service } from '@ez4/common';
import type { Notification } from './contract.js';

/**
 * Definition of a notification message.
 */
export interface MessageSchema {}

/**
 * Incoming notification message.
 */
export type IncomingRequest<T extends MessageSchema> = {
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
 * Incoming request handler.
 */
export type RequestHandler<T extends MessageSchema> = (
  request: IncomingRequest<T>,
  context: Service.Context<Notification.Service<any> | Notification.Import<any>>
) => Promise<void> | void;

/**
 * Notification subscription.
 */
export interface SubscriptionEntry<T extends MessageSchema> {
  /**
   * Subscription handler.
   *
   * @param request Incoming request.
   * @param context Handler context.
   */
  handler: RequestHandler<T>;

  /**
   * Maximum number of concurrent lambdas.
   */
  concurrency?: number;

  /**
   * Variables associated to the subscription.
   */
  variables?: LinkedVariables;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
