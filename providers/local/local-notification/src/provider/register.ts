import type { EmulateServiceEvent } from '@ez4/project/library';

import { isNotificationImport, isNotificationService, registerTriggers as registerNotificationTriggers } from '@ez4/notification/library';
import { createTrigger } from '@ez4/project/library';

import { registerNotificationServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerNotificationTriggers();

  createTrigger('@ez4/local-notification', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isNotificationService(service) || isNotificationImport(service)) {
        return registerNotificationServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
