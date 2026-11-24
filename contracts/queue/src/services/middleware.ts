import type { QueueSubscriptionHandler } from './handler';
import type { QueueMessage } from './message';

/**
 * Queue subscription middleware.
 */
export type QueueSubscriptionMiddleware<T extends QueueMessage> = (next: QueueSubscriptionHandler<T>) => QueueSubscriptionHandler<T>;
