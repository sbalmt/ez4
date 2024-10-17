import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { createTrigger } from '@ez4/project/library';

import { registerClusterProvider } from '../cluster/provider.js';
import { registerInstanceProvider } from '../instance/provider.js';

import { prepareDatabaseServices } from './cluster.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareLinkedService } from './client.js';

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
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareDatabaseServices
  });

  registerClusterProvider();
  registerInstanceProvider();

  isRegistered = true;
};
