import type { PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy } from '@ez4/aws-identity';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = (event: PolicyResourceEvent) => {
  const { state, options } = event;
  const { resourcePrefix, projectName } = options;

  const prefix = `${resourcePrefix}-${projectName}`;

  return createPolicy(state, {
    policyName: `${prefix}-bucket-policy`,
    policyDocument: getPolicyDocument(prefix)
  });
};
