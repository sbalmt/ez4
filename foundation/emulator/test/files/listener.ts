import type { Service } from '@ez4/common';

import { ServiceEventType } from '@ez4/common';

export const listener = (event: Service.AnyEvent<{}>) => {
  switch (event.type) {
    case ServiceEventType.Begin:
      break;

    case ServiceEventType.Ready:
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
