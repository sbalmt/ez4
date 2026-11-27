import type { Database } from '@ez4/database';
import type { ExampleSchema } from './schema';

/**
 * Wrap database stream handler execution.
 */
export function streamMiddleware(next: Database.Handler<ExampleSchema>): Database.Handler<ExampleSchema> {
  return async (request, context) => {
    console.log('Stream middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('Stream middleware after', request.requestId);
    }
  };
}
