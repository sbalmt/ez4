import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types';

/**
 * Wrap queue handler execution.
 */
export function queueMiddleware(next: Queue.Handler<MessageRequest>): Queue.Handler<MessageRequest> {
  return async (request, context) => {
    console.log('Queue middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('Queue middleware after', request.requestId);
    }
  };
}
