import type { EmulateServiceEvent } from '@ez4/project/library';

import { isHttpImport, isHttpService, isWsService, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerHttpRemoteServices } from './http/remote';
import { registerHttpLocalServices } from './http/local';
import { registerWsLocalServices } from './ws/local';

export const registerTriggers = () => {
  registerGatewayTriggers();

  tryCreateTrigger('@ez4/local-gateway', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isHttpService(service)) {
        return registerHttpLocalServices(service, options, context);
      }

      if (isWsService(service)) {
        return registerWsLocalServices(service, options, context);
      }

      if (isHttpImport(service)) {
        return registerHttpRemoteServices(service, options, context);
      }

      return null;
    }
  });
};
