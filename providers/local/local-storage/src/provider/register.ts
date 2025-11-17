import type { EmulateServiceEvent } from '@ez4/project/library';

import { isBucketService, registerTriggers as registerStorageTriggers } from '@ez4/storage/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerBucketEmulator } from './emulator';

export const registerTriggers = () => {
  registerStorageTriggers();

  tryCreateTrigger('@ez4/local-storage', {
    'emulator:getServices': ({ service, options }: EmulateServiceEvent) => {
      if (isBucketService(service)) {
        return registerBucketEmulator(service, options);
      }

      return null;
    }
  });
};
