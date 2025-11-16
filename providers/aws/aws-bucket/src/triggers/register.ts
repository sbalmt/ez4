import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAwsFunctionTriggers } from '@ez4/aws-function';
import { registerTriggers as registerStorageTriggers } from '@ez4/storage/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { registerBucketProvider } from '../bucket/provider';
import { registerPolicyProvider } from '../policy/provider';
import { registerObjectProvider } from '../object/provider';
import { connectBucketServices, prepareBucketServices, prepareLinkedServices } from './service';
import { prepareExecutionPolicy } from './policy';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAwsFunctionTriggers();
  registerStorageTriggers();

  tryCreateTrigger('@ez4/aws-bucket', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareBucketServices,
    'deploy:connectResources': connectBucketServices
  });

  registerBucketProvider();
  registerPolicyProvider();
  registerObjectProvider();
};
