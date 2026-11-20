import type { Http } from '@ez4/gateway';

import { ServiceEventType } from '@ez4/runtime';

/**
 * Wrap API route handler execution.
 */
export function apiMiddleware(next: Http.Handler<Http.Request>): Http.Handler<Http.Request> {
  return async (request, context) => {
    console.log('API middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('API middleware after', request.requestId);
    }
  };
}

/**
 * Watch API lifecycle events.
 */
export function apiListener(event: Http.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Request begin', event.request);
      break;

    case ServiceEventType.Ready:
      console.log('Request ready', event.request);
      break;

    case ServiceEventType.Done:
      console.log('Event done', event.request);
      break;

    case ServiceEventType.Timeout:
      console.log('Event timeout', event.request);
      break;

    case ServiceEventType.Error:
      console.log('Request error', event.request);
      break;

    case ServiceEventType.End:
      console.log('Request end', event.request);
      break;
  }
}
