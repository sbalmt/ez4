import type { EmulateServiceEvent } from '@ez4/project/library';

import { isQueueImport, isQueueService, registerTriggers as registerQueueTriggers } from '@ez4/queue/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerRemoteServices } from './remote';
import { registerLocalServices } from './local';

export const registerTriggers = () => {
  registerQueueTriggers();

  tryCreateTrigger('@ez4/local-queue', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isQueueService(service)) {
        return registerLocalServices(service, options, context);
      }

      if (isQueueImport(service)) {
        return registerRemoteServices(service, options);
      }

      return null;
    }
  });
};
