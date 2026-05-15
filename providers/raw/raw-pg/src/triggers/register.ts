import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { registerMigrationProvider } from '../migration/provider';
import { prepareEmulatorClient } from './client';
import { prepareEmulatorStart, prepareEmulatorReset } from './migration';
import { prepareDatabaseServices, prepareLinkedServices } from './service';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerDatabaseTriggers();

  tryCreateTrigger('@ez4/raw-pg', {
    'deploy:prepareResources': prepareDatabaseServices,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'emulator:getClient': prepareEmulatorClient,
    'emulator:startService': prepareEmulatorStart,
    'emulator:resetService': prepareEmulatorReset
  });

  registerMigrationProvider();
};
