import type { EntryState, StepContext } from '@ez4/stateful';
import type { PolicyState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { PolicyServiceType } from './types.js';

export const getCachePolicyId = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | PolicyState>
) => {
  const resource = context.getDependencies(PolicyServiceType).at(0)?.result;

  if (!resource?.policyId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
  }

  return resource.policyId;
};
