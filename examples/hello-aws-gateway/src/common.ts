import type { Http } from '@ez4/gateway';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch API lifecycle events.
 */
export function apiListener(event: Http.ServiceEvent) {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Request begin', JSON.stringify(event.request));
      break;

    case ServiceEventType.Ready:
      console.log('Request ready', JSON.stringify(event.request));
      break;

    case ServiceEventType.Error:
      console.log('Request error', JSON.stringify(event.request));
      break;

    case ServiceEventType.End:
      console.log('Request end', JSON.stringify(event.request));
      break;
  }
}
