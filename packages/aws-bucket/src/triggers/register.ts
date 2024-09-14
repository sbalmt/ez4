import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';

import { createTrigger } from '@ez4/project/library';

import { registerBucketProvider } from '../bucket/provider.js';
import { registerObjectProvider } from '../object/provider.js';

import { prepareExecutionPolicy } from './policy.js';
import { prepareBucketServices } from './bucket.js';
import { prepareLinkedService } from './client.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerStorageTriggers();

  createTrigger('@ez4/aws-bucket', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedService,
    'deploy:prepareResources': prepareBucketServices
  });

  registerBucketProvider();
  registerObjectProvider();

  isRegistered = true;
};
