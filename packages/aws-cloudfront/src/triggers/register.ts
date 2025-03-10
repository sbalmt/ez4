import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAWSCertificateTriggers } from '@ez4/aws-certificate';
import { registerTriggers as registerAWSBucketTriggers } from '@ez4/aws-bucket';
import { registerTriggers as registerDistributionTriggers } from '@ez4/distribution/library';

import { createTrigger } from '@ez4/project/library';

import { registerCachePolicyProvider } from '../cache/provider.js';
import { registerOriginPolicyProvider } from '../origin/provider.js';
import { registerOriginAccessProvider } from '../access/provider.js';
import { registerDistributionProvider } from '../distribution/provider.js';
import { registerInvalidationProvider } from '../invalidation/provider.js';
import { prepareCdnServices, connectCdnServices } from './service.js';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAWSCertificateTriggers();
  registerAWSBucketTriggers();
  registerDistributionTriggers();

  createTrigger('@ez4/aws-cloudfront', {
    'deploy:prepareResources': prepareCdnServices,
    'deploy:connectResources': connectCdnServices
  });

  registerCachePolicyProvider();
  registerOriginPolicyProvider();
  registerOriginAccessProvider();
  registerDistributionProvider();
  registerInvalidationProvider();

  isRegistered = true;
};
