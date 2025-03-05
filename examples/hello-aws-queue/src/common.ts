import type { Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

import { EventType } from '@ez4/common';

/**
 * Watch Queue lifecycle events.
 */
export function queueListener(event: Service.Event<Queue.Incoming<Queue.Message>>) {
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
