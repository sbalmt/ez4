import type { Database } from '@ez4/database';
import type { ExampleSchema } from './schema.js';

import { StreamType } from '@ez4/database';

/**
 * Handler for table changes.
 */
export async function streamHandler(request: Database.Incoming<ExampleSchema>): Promise<void> {
  switch (request.type) {
    case StreamType.Insert:
      console.log('Record inserted.');
      break;

    case StreamType.Update:
      console.log('Record updated.');
      break;

    case StreamType.Delete:
      console.log('Record deleted.');
      break;
  }

  // Do another stuff...
}
