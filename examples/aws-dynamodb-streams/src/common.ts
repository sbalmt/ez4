import type { Database } from '@ez4/database';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch stream lifecycle events.
 */
export function streamListener(event: Database.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Event begin', JSON.stringify(event.request));
      break;

    case ServiceEventType.Ready:
      console.log('Event ready', JSON.stringify(event.request));
      break;

    case ServiceEventType.Error:
      console.log('Event error', JSON.stringify(event.request));
      break;

    case ServiceEventType.End:
      console.log('Event end', JSON.stringify(event.request));
      break;
  }
}
