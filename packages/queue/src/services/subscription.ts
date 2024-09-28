import type { LinkedVariables } from '@ez4/project/library';
import type { IncomingRequest } from './incoming.js';
import type { HandlerSignature } from './handler.js';
import type { MessageSchema } from './message.js';

/**
 * Queue subscription.
 */
export interface SubscriptionEntry<T extends MessageSchema> {
  /**
   * Subscription handler.
   *
   * @param request Incoming request.
   * @param context Handler context.
   */
  handler: HandlerSignature<IncomingRequest<T>>;

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
