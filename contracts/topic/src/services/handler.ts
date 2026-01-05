import type { Service } from '@ez4/common';
import type { TopicMessage } from './message';
import type { TopicIncoming } from './incoming';
import type { Topic } from './contract';

/**
 * Message handler.
 */
export type TopicSubscriptionHandler<T extends TopicMessage> = (
  request: TopicIncoming<T>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;
