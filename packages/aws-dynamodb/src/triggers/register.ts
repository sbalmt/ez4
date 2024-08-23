import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';

import { createTrigger } from '@ez4/project/library';

import { prepareDatabaseServices } from './table.js';
import { prepareExecutionPolicy } from './policy.js';
import { prepareLinkedService } from './client.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerAwsFunctionTriggers();
    registerDatabaseTriggers();

    createTrigger('@ez4/aws-dynamodb', {
      'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
      'deploy:prepareLinkedService': prepareLinkedService,
      'deploy:prepareResources': prepareDatabaseServices
    });

    isRegistered = true;
  }

  return isRegistered;
};
