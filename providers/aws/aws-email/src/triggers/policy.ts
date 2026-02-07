import type { PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';
import { ServiceType } from '@ez4/email/library';

import { getPolicyDocument } from '../utils/policy';

export const prepareExecutionPolicy = (event: PolicyResourceEvent) => {
  const { state, serviceType, options } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-email-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: getPolicyDocument(),
      policyName
    })
  );
};
