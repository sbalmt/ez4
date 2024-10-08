import type { EntryState, StepContext } from '@ez4/stateful';
import type { PolicyState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { PolicyServiceType } from './types.js';

export const isCachePolicyState = (resource: EntryState): resource is PolicyState => {
  return resource.type === PolicyServiceType;
};

export const getCachePolicyIds = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | PolicyState>
) => {
  const resources = context.getDependencies(PolicyServiceType);

  return resources.map(({ result }) => {
    if (!result?.policyId) {
      throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
    }

    return result.policyId;
  });
};
