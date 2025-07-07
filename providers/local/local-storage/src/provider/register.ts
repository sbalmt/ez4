import type { EmulateServiceEvent } from '@ez4/project/library';

import { isBucketService } from '@ez4/storage/library';
import { createTrigger } from '@ez4/project/library';

import { registerBucketEmulator } from './emulator.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

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
