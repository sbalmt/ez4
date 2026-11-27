import type { Topic } from '@ez4/topic';
import type { EventRequest } from '../types';

/**
 * Wrap topic handler execution.
 */
export function topicMiddleware(next: Topic.Handler<EventRequest>): Topic.Handler<EventRequest> {
  return async (request, context) => {
    console.log('Topic middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('Topic middleware after', request.requestId);
    }
  };
}
