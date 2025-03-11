import type { PolicyResourceEvent } from '@ez4/project/library';

import { ServiceType } from '@ez4/storage/library';
import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = (event: PolicyResourceEvent) => {
  const { state, serviceType, options } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-bucket-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      policyDocument: getPolicyDocument(policyPrefix),
      policyName
    })
  );
};
