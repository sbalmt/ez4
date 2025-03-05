import type { Http } from '@ez4/gateway';

import { EventType } from '@ez4/common';

/**
 * Watch API lifecycle events.
 */
export function apiListener(event: Http.ServiceEvent) {
  switch (event.type) {
    case EventType.Begin:
      console.log('Request begin', JSON.stringify(event.request));
      break;

    case EventType.Ready:
      console.log('Request ready', JSON.stringify(event.request));
      break;

    case EventType.Error:
      console.log('Request error', JSON.stringify(event.request));
      break;

    case EventType.End:
      console.log('Request end', JSON.stringify(event.request));
      break;
  }
}
