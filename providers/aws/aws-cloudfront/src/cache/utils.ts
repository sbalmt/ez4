import type { EntryState, StepContext } from '@ez4/stateful';
import type { CacheState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { CacheServiceType } from './types.js';

export const isCachePolicyState = (resource: EntryState): resource is CacheState => {
  return resource.type === CacheServiceType;
};

export const getCachePolicyId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resources = context.getDependencies<CacheState>(CacheServiceType);

  const cachePolicy = resources.find(({ entryId }) => entryId === resourceId);

  if (!cachePolicy?.result?.policyId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
  }

  return cachePolicy.result.policyId;
};
