import type { Database } from '@ez4/database';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch stream lifecycle events.
 */
export function streamListener(event: Database.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Event begin', event.request);
      break;

    case ServiceEventType.Ready:
      console.log('Event ready', event.request);
      break;

    case ServiceEventType.Done:
      console.log('Event done', event.request);
      break;

    case ServiceEventType.Error:
      console.log('Event error', event.request);
      break;

    case ServiceEventType.End:
      console.log('Event end', event.request);
      break;
  }
}
