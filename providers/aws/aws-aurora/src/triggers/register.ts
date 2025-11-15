import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { createTrigger } from '@ez4/project/library';

import { registerClusterProvider } from '../cluster/provider';
import { registerInstanceProvider } from '../instance/provider';
import { registerMigrationProvider } from '../migration/provider';
import { prepareDatabaseServices, prepareLinkedServices } from './service';
import { prepareEmulatorStart, prepareEmulatorReset } from './migration';
import { prepareExecutionPolicy } from './policy';
import { prepareEmulatorClient } from './client';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerDatabaseTriggers();

  createTrigger('@ez4/aws-aurora', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareDatabaseServices,
    'emulator:getClient': prepareEmulatorClient,
    'emulator:startService': prepareEmulatorStart,
    'emulator:resetService': prepareEmulatorReset
  });

  registerClusterProvider();
  registerInstanceProvider();
  registerMigrationProvider();

  isRegistered = true;
};
