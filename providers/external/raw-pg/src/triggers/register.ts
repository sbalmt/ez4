import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { prepareEmulatorClient } from './client';
import { prepareEmulatorStart, prepareEmulatorReset } from './migration';
import { prepareDatabaseServices, prepareLinkedServices } from './service';

export const registerTriggers = () => {
  registerDatabaseTriggers();

  tryCreateTrigger('@ez4/raw-pg', {
    'deploy:prepareResources': prepareDatabaseServices,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'emulator:getClient': prepareEmulatorClient,
    'emulator:startService': prepareEmulatorStart,
    'emulator:resetService': prepareEmulatorReset
  });
};
