import type { PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, options } = event;

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-lambda-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: await getPolicyDocument(policyPrefix),
      policyName
    })
  );
};
