import type { Service } from '@ez4/common';
import type { TopicEvent } from './event';
import type { TopicIncoming } from './incoming';
import type { Topic } from './contract';

/**
 * Event handler.
 */
export type TopicSubscriptionHandler<T extends TopicEvent> = (
  request: TopicIncoming<T>,
  context: Service.Context<Topic.Service<any, any> | Topic.Import<any>>
) => Promise<void> | void;
