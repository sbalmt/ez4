import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';

import { createTrigger } from '@ez4/project/library';

import { prepareExecutionPolicy } from './policy.js';
import { prepareLinkedService } from './client.js';
import { prepareBucketServices } from './bucket.js';

let isRegistered = false;

/**
 * Register all triggers.
 */
export const registerTriggers = () => {
  if (!isRegistered) {
    registerAwsTriggers();
    registerAwsIdentityTriggers();
    registerStorageTriggers();

    createTrigger('@ez4/aws-bucket', {
      'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
      'deploy:prepareLinkedService': prepareLinkedService,
      'deploy:prepareResources': prepareBucketServices
    });

    isRegistered = true;
  }

  return isRegistered;
};
