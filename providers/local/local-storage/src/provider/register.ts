import type { EmulateServiceEvent } from '@ez4/project/library';

import { isBucketService, registerTriggers as registerStorageTriggers } from '@ez4/storage/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerLocalService } from './local';

export const registerTriggers = () => {
  registerStorageTriggers();

  tryCreateTrigger('@ez4/local-storage', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isBucketService(service)) {
        return registerLocalService(service, options, context);
      }

      return null;
    }
  });
};
