import type { Http } from '@ez4/gateway';

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
