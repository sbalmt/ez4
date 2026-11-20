import type { Ws } from '@ez4/gateway';

/**
 * Wrap WebSocket handler execution.
 */
export function wsMiddleware(
  next: Ws.Handler<Ws.Request | Ws.Event, Ws.Response | void>
): Ws.Handler<Ws.Request | Ws.Event, Ws.Response | void> {
  return async (request, context) => {
    const requestId = 'requestId' in request ? request.requestId : undefined;

    console.log('WebSocket middleware before', requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('WebSocket middleware after', requestId);
    }
  };
}
