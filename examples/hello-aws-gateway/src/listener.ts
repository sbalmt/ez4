import type { Http } from '@ez4/gateway';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch API lifecycle events.
 */
export function apiListener(event: Http.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Request begin', event.request);
      break;

    case ServiceEventType.Ready:
      console.log('Request ready', event.request);
      break;

    case ServiceEventType.Error:
      console.log('Request error', event.request);
      break;

    case ServiceEventType.End:
      console.log('Request end', event.request);
      break;
  }
}
