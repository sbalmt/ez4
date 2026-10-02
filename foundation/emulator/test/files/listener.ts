import type { AnyObject } from '@ez4/utils';
import type { Service } from '@ez4/common';

import { ServiceEventType } from '@ez4/common';

export const listener = (event: Service.AnyEvent<AnyObject>) => {
  switch (event.type) {
    case ServiceEventType.Begin:
      break;

    case ServiceEventType.Ready:
      if (!event.request.preparedByManager) {
        throw new Error('Manager preparation must finish before the Ready event.');
      }

      break;

    case ServiceEventType.Done:
      break;

    case ServiceEventType.Timeout:
      break;

    case ServiceEventType.Error:
      break;

    case ServiceEventType.End:
      break;
  }
};
