import type { EmulateServiceEvent } from '@ez4/project/library';

import { isQueueImport, isQueueService } from '@ez4/queue/library';
import { createTrigger } from '@ez4/project/library';

import { registerQueueServices } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/local-queue', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isQueueService(service) || isQueueImport(service)) {
        return registerQueueServices(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
