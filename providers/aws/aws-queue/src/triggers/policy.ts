import type { PolicyResourceEvent } from '@ez4/project/library';

import { createExecutionPolicy } from '@ez4/aws-function';
import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { ImportType, ServiceType } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';

import { hasQueueLambdaSubscriptions } from './utils';
import { getPolicyDocument } from '../utils/policy';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, services, options } = event;

  if (serviceType !== ServiceType && serviceType !== ImportType) {
    return null;
  }

  const prefixList = Object.values({ options, ...options.imports }).map((options) => {
    return getServiceName('', options);
  });

  const [policyPrefix] = prefixList;

  const policyName = `${policyPrefix}-queue-policy`;

  const policy =
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: await getPolicyDocument(prefixList),
      policyName
    });

  if (hasQueueLambdaSubscriptions(services)) {
    return [policy, await createExecutionPolicy(state, options)];
  }

  return [policy];
};
