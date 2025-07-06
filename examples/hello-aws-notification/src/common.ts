import type { Notification } from '@ez4/notification';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch notification lifecycle events.
 */
export function notificationListener(event: Notification.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Event begin', event.request);
      break;

    case ServiceEventType.Ready:
      console.log('Event ready', event.request);
      break;

    case ServiceEventType.Error:
      console.log('Event error', event.request);
      break;

    case ServiceEventType.End:
      console.log('Event end', event.request);
      break;
  }
}
