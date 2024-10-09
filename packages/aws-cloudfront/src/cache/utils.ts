import type { EntryState, StepContext } from '@ez4/stateful';
import type { CacheState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { CacheServiceType } from './types.js';

export const isCachePolicyState = (resource: EntryState): resource is CacheState => {
  return resource.type === CacheServiceType;
};

export const getCachePolicyIds = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const resources = context.getDependencies<CacheState>(CacheServiceType);

  return resources.map(({ result }) => {
    if (!result?.policyId) {
      throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
    }

    return result.policyId;
  });
};
