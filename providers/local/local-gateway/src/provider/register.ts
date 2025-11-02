import type { EmulateServiceEvent } from '@ez4/project/library';

import { isHttpImport, isHttpService, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { createTrigger } from '@ez4/project/library';

import { registerRemoteServices } from './remote';
import { registerLocalServices } from './local';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerGatewayTriggers();

  createTrigger('@ez4/local-gateway', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isHttpService(service)) {
        return registerLocalServices(service, options, context);
      }

      if (isHttpImport(service)) {
        return registerRemoteServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
