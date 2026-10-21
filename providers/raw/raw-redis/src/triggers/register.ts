import { registerTriggers as registerCacheTriggers } from '@ez4/cache/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { prepareEmulatorDescriptor, resetEmulatorService, stopEmulatorService } from './emulator';
import { prepareCacheServices, prepareLinkedServices } from './service';

export const registerTriggers = () => {
  registerCacheTriggers();

  tryCreateTrigger('@ez4/raw-redis', {
    'deploy:prepareResources': prepareCacheServices,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'emulator:serviceDescriptor': prepareEmulatorDescriptor,
    'emulator:resetService': resetEmulatorService,
    'emulator:stopService': stopEmulatorService
  });
};
