import type { EmulateServiceEvent } from '@ez4/project/library';

import { isCronService, registerTriggers as registerSchedulerTriggers } from '@ez4/scheduler/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerCronEmulator } from './emulator';

export const registerTriggers = () => {
  registerSchedulerTriggers();

  tryCreateTrigger('@ez4/local-scheduler', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isCronService(service)) {
        return registerCronEmulator(service, options, context);
      }

      return null;
    }
  });
};
