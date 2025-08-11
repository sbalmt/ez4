import type { Cron } from '@ez4/scheduler';
import type { DynamicEvent } from './types.js';

import { ServiceEventType } from '@ez4/common';

/**
 * Watch scheduler lifecycle events.
 */
export function schedulerListener(event: Cron.ServiceEvent | Cron.ServiceEvent<DynamicEvent>) {
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
