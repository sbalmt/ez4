import type { EmulateServiceEvent } from '@ez4/project/library';

import { isDatabaseService, registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerDatabaseEmulator } from './emulator';

export const registerTriggers = () => {
  registerDatabaseTriggers();

  tryCreateTrigger('@ez4/local-database', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isDatabaseService(service)) {
        return registerDatabaseEmulator(service, options, context);
      }

      return null;
    }
  });
};
