import type { Service } from '@ez4/common';
import type { TopicMessage } from './message';
import type { TopicIncoming } from './incoming';
import type { Topic } from './contract';

/**
 * Message listener.
 */
export type TopicSubscriptionListener<T extends TopicMessage> = (
  event: Service.AnyEvent<TopicIncoming<T>>,
  context: Service.Context<Topic.Service<any> | Topic.Import<any>>
) => Promise<void> | void;
