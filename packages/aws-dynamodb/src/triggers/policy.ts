import type { PolicyResourceEvent } from '@ez4/project/library';

import { ServiceType } from '@ez4/database/library';
import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, options } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-dynamodb-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      policyDocument: await getPolicyDocument(policyPrefix, true),
      policyName
    })
  );
};
