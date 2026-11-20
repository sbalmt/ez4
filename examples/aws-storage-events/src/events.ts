import type { Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';
import type { Storage } from './service';

import { BucketEventType } from '@ez4/storage';

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

/**
 * Handler for bucket changes.
 */
export async function eventHandler(request: Bucket.ObjectEvent, { selfClient }: Service.Context<Storage>): Promise<void> {
  switch (request.eventType) {
    case BucketEventType.Create:
      console.log('Object created.');
      break;

    case BucketEventType.Delete:
      console.log('Object deleted.');
      break;
  }

  // Do another stuff...
  selfClient.scan;
}
