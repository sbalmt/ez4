import type { AnyObject } from '@ez4/utils';
import type { Service } from '@ez4/common';

import { ServiceEventType } from '@ez4/common';

export const defaultListener = (event: Service.AnyEvent<AnyObject>) => {
  switch (event.type) {
    case ServiceEventType.Begin:
      console.log('Begin event.');
      break;

    case ServiceEventType.Ready:
      console.log('Ready event.');
      break;

    case ServiceEventType.Done:
      console.log('Done event.');
      break;

    case ServiceEventType.Timeout:
      console.log('Timeout event.');
      break;

    case ServiceEventType.Error:
      console.log('Error event.');
      break;

    case ServiceEventType.End:
      console.log('End event.');
      break;
  }
};

export const testListener = (event: Service.AnyEvent<AnyObject>) => {
  switch (event.type) {
    case ServiceEventType.Begin:
      break;

    case ServiceEventType.Ready:
      if (!event.request.preparedByInvoker) {
        throw new Error('Invoker preparation must finish before the Ready event.');
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
