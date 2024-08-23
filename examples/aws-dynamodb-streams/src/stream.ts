import type { StreamChange } from '@ez4/database';
import type { TableSchema } from './schema.js';

import { StreamType } from '@ez4/database';

/**
 * Handler for table changes.
 */
export async function streamHandler(request: StreamChange<TableSchema>): Promise<void> {
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
