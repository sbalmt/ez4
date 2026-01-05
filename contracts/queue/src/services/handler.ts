import type { Service } from '@ez4/common';
import type { QueueIncoming } from './incoming';
import type { QueueMessage } from './message';
import type { Queue } from './contract';

/**
 * Queue subscription handler.
 */
export type QueueSubscriptionHandler<T extends QueueMessage> = (
  request: QueueIncoming<T>,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
