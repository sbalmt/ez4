import { createTrigger, EmulateServiceEvent } from '@ez4/project/library';

import { isNotificationService } from '@ez4/notification/library';

import { registerNotificationServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/local-notification', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isNotificationService(service)) {
        return registerNotificationServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
