import { createTrigger, EmulateServiceEvent } from '@ez4/project/library';

import { isHttpService } from '@ez4/gateway/library';

import { registerHttpServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/local-gateway', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isHttpService(service)) {
        return registerHttpServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
