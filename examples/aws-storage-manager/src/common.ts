import type { Bucket } from '@ez4/storage';

import { EventType } from '@ez4/common';

/**
 * Watch storage lifecycle events.
 */
export function syncStorageListener(event: Bucket.ServiceEvent) {
  switch (event.type) {
    case EventType.Begin:
      console.log('Event begin', JSON.stringify(event.request));
      break;

    case EventType.Ready:
      console.log('Event ready', JSON.stringify(event.request));
      break;

    case EventType.Error:
      console.log('Event error', JSON.stringify(event.request));
      break;

    case EventType.End:
      console.log('Event end', JSON.stringify(event.request));
      break;
  }
}
