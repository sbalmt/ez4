import type { Service } from '@ez4/common';
import type { QueueMessage } from './message.js';
import type { Queue } from './queue.js';

/**
 * Incoming request handler.
 */
export type QueueHandler<T extends QueueMessage> = (
  request: T,
  context: Service.Context<Queue.Service<any>>
) => Promise<void> | void;
