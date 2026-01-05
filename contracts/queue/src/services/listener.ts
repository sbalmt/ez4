import type { Service } from '@ez4/common';
import type { QueueIncoming } from './incoming';
import type { QueueMessage } from './message';
import type { Queue } from './contract';

/**
 * Queue subscription listener.
 */
export type QueueSubscriptionListener<T extends QueueMessage> = (
  event: Service.AnyEvent<QueueIncoming<T>>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
