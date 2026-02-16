import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsCacheTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerCacheTriggers } from '@ez4/cache/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerCacheProvider } from '../cache/provider';
import { createEmulatorClient, resetEmulatorService, stopEmulatorService } from './emulator';
import { prepareLinkedServices, prepareServices } from './deploy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsCacheTriggers();
  registerCacheTriggers();

  tryCreateTrigger('@ez4/aws-email', {
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareServices,
    'emulator:getClient': createEmulatorClient,
    'emulator:resetService': resetEmulatorService,
    'emulator:stopService': stopEmulatorService
  });

  registerCacheProvider();
};
