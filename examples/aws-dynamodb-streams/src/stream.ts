import type { StreamChange } from '@ez4/database';
import type { ExampleSchema } from './schema.js';

import { StreamType } from '@ez4/database';

/**
 * Handler for table changes.
 */
export async function streamHandler(request: StreamChange<ExampleSchema>): Promise<void> {
  switch (request.type) {
    case StreamType.Insert:
      // Do some stuff...
      request.record;
      break;

    case StreamType.Update:
      // Do some stuff...
      request.newRecord;
      request.oldRecord;
      break;

    case StreamType.Delete:
      // Do some stuff...
      request.record;
      break;
  }
}
