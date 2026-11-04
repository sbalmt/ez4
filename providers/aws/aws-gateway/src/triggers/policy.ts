import type { PolicyResourceEvent } from '@ez4/project/library';
import type { EntryState } from '@ez4/state';

import { createExecutionPolicy } from '@ez4/aws-function';

import { hasGatewayLambdaServices } from './utils/lambda';
import { prepareWsExecutionPolicy } from './ws/policy';

export const prepareExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { services, options, state } = event;

  const wsPolicy = await prepareWsExecutionPolicy(event);
  const policies: EntryState[] = [];

  if (wsPolicy) {
    policies.push(wsPolicy);
  }

  if (hasGatewayLambdaServices(services)) {
    policies.push(await createExecutionPolicy(state, options));
  }

  return policies;
};
