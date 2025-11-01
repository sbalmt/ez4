import type { Queue } from '@ez4/queue';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch queue lifecycle events.
 */
export function queueListener(event: Queue.ServiceEvent) {
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
