import type { Service } from '@ez4/common';
import type { QueueSubscriptionHandler } from './handler';
import type { QueueMessage } from './message';
import type { Queue } from './contract';

/**
 * Queue subscription middleware.
 */
export type QueueSubscriptionMiddleware<T extends QueueMessage> = (
  next: QueueSubscriptionHandler<T>,
  context: Service.Context<Queue.Service<any, any> | Queue.Import<any>>
) => QueueSubscriptionHandler<T>;
