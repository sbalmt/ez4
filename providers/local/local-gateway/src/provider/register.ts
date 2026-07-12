import type { EmulateServiceEvent } from '@ez4/project/library';

import { isHttpImport, isHttpService, isWsService, registerTriggers as registerGatewayTriggers } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerHttpRemoteService } from './http/remote';
import { registerHttpLocalService } from './http/local';
import { registerWsLocalService } from './ws/local';

export const registerTriggers = () => {
  registerGatewayTriggers();

  tryCreateTrigger('@ez4/local-gateway', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isHttpService(service)) {
        return registerHttpLocalService(service, options, context);
      }

      if (isWsService(service)) {
        return registerWsLocalService(service, options, context);
      }

      if (isHttpImport(service)) {
        return registerHttpRemoteService(service, options, context);
      }

      return null;
    }
  });
};
