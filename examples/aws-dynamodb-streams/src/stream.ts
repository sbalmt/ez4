import type { Service } from '@ez4/common';
import type { Database } from '@ez4/database';
import type { ExampleSchema } from './schema';
import type { Db } from './service';

import { StreamChangeType } from '@ez4/database';

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

/**
 * Handler for table changes.
 */
export async function streamHandler(request: Database.Incoming<ExampleSchema>, { selfClient }: Service.Context<Db>): Promise<void> {
  switch (request.type) {
    case StreamChangeType.Insert:
      console.log('Record inserted.');
      break;

    case StreamChangeType.Update:
      console.log('Record updated.');
      break;

    case StreamChangeType.Delete:
      console.log('Record deleted.');
      break;
  }

  // Do another stuff...
  selfClient.any_example;
}
