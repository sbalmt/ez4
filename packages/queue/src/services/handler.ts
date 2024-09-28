import type { Service } from '@ez4/common';
import type { MessageSchema } from './message.js';
import type { Queue } from './queue.js';

/**
 * Incoming request handler.
 */
export type HandlerSignature<T extends MessageSchema> = (
  request: T,
  context: Service.Context<Queue.Service<any> | Queue.Import<any>>
) => Promise<void> | void;
