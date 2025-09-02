import type { EmulateServiceEvent } from '@ez4/project/library';

import { isBucketService, registerTriggers as registerStorageTriggers } from '@ez4/storage/library';
import { createTrigger } from '@ez4/project/library';

import { registerBucketEmulator } from './emulator';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerStorageTriggers();

  createTrigger('@ez4/local-storage', {
    'emulator:getServices': ({ service, options }: EmulateServiceEvent) => {
      if (isBucketService(service)) {
        return registerBucketEmulator(service, options);
      }

      return null;
    }
  });

  isRegistered = true;
};
