import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

import { WatcherEventType } from '@ez4/common';

/**
 * Watch API lifecycle events.
 */
export function apiWatcher(event: Service.WatcherEvent<Http.Request>) {
  switch (event.type) {
    case WatcherEventType.Begin:
      console.log('Request begin', JSON.stringify(event.request));
      break;

    case WatcherEventType.Error:
      console.log('Request error', JSON.stringify(event.request));
      break;

    case WatcherEventType.End:
      console.log('Request end', JSON.stringify(event.request));
      break;
  }
}
