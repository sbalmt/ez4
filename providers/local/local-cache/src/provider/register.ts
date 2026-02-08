import type { EmulateServiceEvent } from '@ez4/project/library';

import { isCacheService, registerTriggers as registerCacheTriggers } from '@ez4/cache/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerCacheEmulator } from './emulator';

export const registerTriggers = () => {
  registerCacheTriggers();

  tryCreateTrigger('@ez4/local-cache', {
    'emulator:getServices': ({ service, options, context }: EmulateServiceEvent) => {
      if (isCacheService(service)) {
        return registerCacheEmulator(service, options, context);
      }

      return null;
    }
  });
};
