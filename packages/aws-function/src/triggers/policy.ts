import type { PolicyResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { createPolicy } from '@ez4/aws-identity';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, options } = event;

  const prefix = getServiceName('', options);

  return createPolicy(state, {
    policyName: `${prefix}-lambda-policy`,
    policyDocument: await getPolicyDocument(prefix)
  });
};
