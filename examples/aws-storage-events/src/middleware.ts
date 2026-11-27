import type { Bucket } from '@ez4/storage';

/**
 * Wrap storage event handler execution.
 */
export function storageMiddleware(next: Bucket.Handler): Bucket.Handler {
  return async (request, context) => {
    console.log('Storage middleware before', request.objectKey);

    try {
      return await next(request, context);
    } finally {
      console.log('Storage middleware after', request.objectKey);
    }
  };
}
