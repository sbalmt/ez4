import type { TopicSubscriptionHandler } from './handler';
import type { TopicEvent } from './event';

/**
 * Topic subscription middleware.
 */
export type TopicSubscriptionMiddleware<T extends TopicEvent> = (next: TopicSubscriptionHandler<T>) => TopicSubscriptionHandler<T>;
