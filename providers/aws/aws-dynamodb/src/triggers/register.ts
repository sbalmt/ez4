import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { createTrigger } from '@ez4/project/library';

import { registerTableProvider } from '../table/provider.js';
import { connectDatabaseServices, prepareDatabaseServices, prepareLinkedServices } from './service.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareEmulatorClient } from './client.js';
import { isDynamoDbService } from './utils.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerDatabaseTriggers();

  createTrigger('@ez4/aws-dynamodb', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareDatabaseServices,
    'deploy:connectResources': connectDatabaseServices,
    'emulator:getClient': ({ service, options }) => {
      if (isDynamoDbService(service)) {
        return prepareEmulatorClient(service, options);
      }

      return null;
    }
  });

  registerTableProvider();

  isRegistered = true;
};
