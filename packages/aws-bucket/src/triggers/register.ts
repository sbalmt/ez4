import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';

import { createTrigger } from '@ez4/project/library';

import { registerBucketProvider } from '../bucket/provider.js';
import { registerPolicyProvider } from '../policy/provider.js';
import { registerObjectProvider } from '../object/provider.js';
import { connectBucketServices, prepareBucketServices, prepareLinkedServices } from './service.js';
import { prepareExecutionPolicy } from './policy.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerStorageTriggers();

  createTrigger('@ez4/aws-bucket', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareBucketServices,
    'deploy:connectResources': connectBucketServices
  });

  registerBucketProvider();
  registerPolicyProvider();
  registerObjectProvider();

  isRegistered = true;
};
