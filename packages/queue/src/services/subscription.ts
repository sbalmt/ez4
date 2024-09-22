import type { LinkedVariables } from '@ez4/project/library';
import type { QueueIncomingRequest, QueueMessage } from './message.js';
import type { QueueHandler } from './handler.js';

/**
 * Queue subscription.
 */
export interface QueueSubscription<T extends QueueMessage = QueueMessage> {
  /**
   * Subscription handler.
   *
   * @param request Incoming request.
   * @param context Handler context.
   */
  handler: QueueHandler<QueueIncomingRequest<T>>;

  /**
   * Variables associated to the subscription.
   */
  variables?: LinkedVariables;

  /**
   * Amount of memory available for the handler.
   */
  memory?: number;
}
