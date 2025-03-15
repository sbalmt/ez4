import type { PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { ServiceType, ImportType } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy.js';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, options } = event;

  if (serviceType !== ServiceType && serviceType !== ImportType) {
    return null;
  }

  const prefixList = Object.values({ options, ...options.imports }).map((options) => {
    return getServiceName('', options);
  });

  const [policyPrefix] = prefixList;

  const policyName = `${policyPrefix}-queue-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      policyDocument: await getPolicyDocument(prefixList),
      policyName
    })
  );
};
