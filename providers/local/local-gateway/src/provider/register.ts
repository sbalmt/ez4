import type { EmulateServiceEvent } from '@ez4/project/library';

import { isHttpService, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { createTrigger } from '@ez4/project/library';

import { registerHttpServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerGatewayTriggers();

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
