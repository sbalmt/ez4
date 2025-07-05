import type { EmulateServiceEvent } from '@ez4/project/library';

import { isCronService } from '@ez4/scheduler/library';
import { createTrigger } from '@ez4/project/library';

import { registerCronEmulator } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/local-scheduler', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isCronService(service)) {
        return registerCronEmulator(service, options, context);
      }

      return null;
    }
  });

  isRegistered = true;
};
