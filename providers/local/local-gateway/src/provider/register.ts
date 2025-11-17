import type { EmulateServiceEvent } from '@ez4/project/library';

import { isHttpImport, isHttpService, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerRemoteServices } from './remote';
import { registerLocalServices } from './local';

export const registerTriggers = () => {
  registerGatewayTriggers();

  tryCreateTrigger('@ez4/local-gateway', {
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
};
