import type { DeployOptions, PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy } from '@ez4/aws-identity';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, options } = event;

  const prefixList = Object.values({ options, ...options.imports }).map(getPolicyPrefix);

  const [policyPrefix] = prefixList;

  return createPolicy(state, {
    policyName: `${policyPrefix}-notification-policy`,
    policyDocument: await getPolicyDocument(prefixList)
  });
};

const getPolicyPrefix = (options: DeployOptions) => {
  return `${options.resourcePrefix}-${options.projectName}`;
};
