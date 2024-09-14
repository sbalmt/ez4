import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAWSBucketTriggers } from '@ez4/aws-bucket';
import { registerTriggers as registerDistributionTriggers } from '@ez4/distribution/library';

import { createTrigger } from '@ez4/project/library';

import { registerDistributionProvider } from '../distribution/provider.js';
import { prepareCdnServices } from './distribution.js';
import { prepareExecutionPolicy } from './policy.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAWSBucketTriggers();
  registerDistributionTriggers();

  createTrigger('@ez4/aws-cloudfront', {
    'deploy:prepareExecutionPolicy': prepareExecutionPolicy,
    'deploy:prepareResources': prepareCdnServices
  });

  registerDistributionProvider();

  isRegistered = true;
};
