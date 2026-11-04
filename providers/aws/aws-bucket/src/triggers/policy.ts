import type { PolicyResourceEvent } from '@ez4/project/library';

import { createExecutionPolicy } from '@ez4/aws-function';
import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';
import { ServiceType } from '@ez4/storage/library';

import { getPolicyDocument } from '../utils/policy';
import { hasBucketEvents } from './utils';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, services, options } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-bucket-policy`;

  const policy =
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: getPolicyDocument(policyPrefix),
      policyName
    });

  if (hasBucketEvents(services)) {
    return [policy, await createExecutionPolicy(state, options)];
  }

  return [policy];
};
