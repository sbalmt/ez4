import { registerTriggers as registerAwsTriggers } from '@ez4/aws-common';
import { registerTriggers as registerAwsIdentityTriggers } from '@ez4/aws-identity';
import { registerTriggers as registerAWSCertificateTriggers } from '@ez4/aws-certificate';
import { registerTriggers as registerAWSBucketTriggers } from '@ez4/aws-bucket';
import { registerTriggers as registerDistributionTriggers } from '@ez4/distribution/library';

import { tryCreateTrigger } from '@ez4/project/library';

import { registerCachePolicyProvider } from '../cache/provider';
import { registerOriginPolicyProvider } from '../origin/provider';
import { registerOriginAccessProvider } from '../access/provider';
import { registerDistributionProvider } from '../distribution/provider';
import { registerInvalidationProvider } from '../invalidation/provider';
import { prepareCdnServices, connectCdnServices } from './service';

export const registerTriggers = () => {
  registerAwsTriggers();
  registerAwsIdentityTriggers();
  registerAWSCertificateTriggers();
  registerAWSBucketTriggers();
  registerDistributionTriggers();

  tryCreateTrigger('@ez4/aws-cloudfront', {
    'deploy:prepareResources': prepareCdnServices,
    'deploy:connectResources': connectCdnServices
  });

  registerCachePolicyProvider();
  registerOriginPolicyProvider();
  registerOriginAccessProvider();
  registerDistributionProvider();
  registerInvalidationProvider();
};
