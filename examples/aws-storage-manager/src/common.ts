import type { Bucket } from '@ez4/storage';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch storage lifecycle events.
 */
export function syncStorageListener(event: Bucket.ServiceEvent) {
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
