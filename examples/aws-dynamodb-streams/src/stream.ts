import type { Service } from '@ez4/common';
import type { Database } from '@ez4/database';
import type { ExampleSchema } from './schema.js';
import type { Db } from './service.js';

import { StreamType } from '@ez4/database';

/**
 * Handler for table changes.
 */
export async function streamHandler(request: Database.Incoming<ExampleSchema>, context: Service.Context<Db>): Promise<void> {
  const { selfClient } = context;

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
  selfClient.example;
}
