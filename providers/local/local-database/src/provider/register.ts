import type { EmulateServiceEvent } from '@ez4/project/library';

import { isDatabaseService, registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';
import { createTrigger } from '@ez4/project/library';

import { registerDatabaseEmulator } from './emulator';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerDatabaseTriggers();

  createTrigger('@ez4/local-database', {
    'emulator:getServices': ({ service, options }: EmulateServiceEvent) => {
      if (isDatabaseService(service)) {
        return registerDatabaseEmulator(service, options);
      }

      return null;
    }
  });

  isRegistered = true;
};
