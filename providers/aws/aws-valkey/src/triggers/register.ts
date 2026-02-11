import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsCacheTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerCacheTriggers } from '@ez4/cache/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerCacheProvider } from '../cache/provider';
import { prepareLinkedServices, prepareServices } from './service';
import { prepareEmulatorReset } from './migration';
import { prepareEmulatorClient } from './client';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsCacheTriggers();
  registerCacheTriggers();

  tryCreateTrigger('@ez4/aws-email', {
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareServices,
    'emulator:getClient': prepareEmulatorClient,
    'emulator:resetService': prepareEmulatorReset
  });

  registerCacheProvider();
};
