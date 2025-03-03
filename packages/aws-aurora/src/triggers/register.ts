import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { createTrigger } from '@ez4/project/library';

import { registerClusterProvider } from '../cluster/provider.js';
import { registerInstanceProvider } from '../instance/provider.js';
import { registerMigrationProvider } from '../migration/provider.js';
import { prepareDatabaseServices, prepareLinkedServices } from './service.js';
import { prepareExecutionPolicy } from './policy.js';

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
    'deploy:prepareResources': prepareDatabaseServices
  });

  registerClusterProvider();
  registerInstanceProvider();
  registerMigrationProvider();

  isRegistered = true;
};
