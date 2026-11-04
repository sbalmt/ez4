import type { PolicyResourceEvent } from '@ez4/project/library';

import { ServiceType } from '@ez4/database/library';
import { createExecutionPolicy } from '@ez4/aws-function';
import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';

import { getPolicyDocument } from '../utils/policy';
import { hasDynamoDbStreams } from './utils';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, services, options } = event;

  if (serviceType !== ServiceType) {
    return null;
  }

  const hasStreams = hasDynamoDbStreams(services);

  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-dynamodb-policy`;

  const policy =
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: await getPolicyDocument(policyPrefix, hasStreams),
      policyName
    });

  if (hasStreams) {
    return [policy, await createExecutionPolicy(state, options)];
  }

  return [policy];
};
