import type { Service } from '@ez4/common';
import type { TopicSubscriptionHandler } from './handler';
import type { TopicEvent } from './event';
import type { Topic } from './contract';

/**
 * Topic subscription middleware.
 */
export type TopicSubscriptionMiddleware<T extends TopicEvent> = (
  next: TopicSubscriptionHandler<T>,
  context: Service.Context<Topic.Service<any, any> | Topic.Import<any>>
) => TopicSubscriptionHandler<T>;
