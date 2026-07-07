import type { EmulateServiceEvent } from '@ez4/project/library';

import { isCronService, registerTriggers as registerSchedulerTriggers } from '@ez4/scheduler/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerLocalService } from './local';

export const registerTriggers = () => {
  registerSchedulerTriggers();

  tryCreateTrigger('@ez4/local-scheduler', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isCronService(service)) {
        return registerLocalService(service, options, context);
      }

      return null;
    }
  });
};
