import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { CacheState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';

import { CacheServiceType } from './types';

export const isCachePolicyState = (resource: EntryState): resource is CacheState => {
  return resource.type === CacheServiceType;
};

export const tryGetCachePolicyState = (context: EventContext, policyName: string, options: DeployOptions) => {
  try {
    const cacheState = context.getServiceState(policyName, options);

    if (isCachePolicyState(cacheState)) {
      return cacheState;
    }
  } catch {}

  return undefined;
};

export const getCachePolicyId = (serviceName: string, resourceId: string, context: StepContext) => {
  const resources = context.getDependencies<CacheState>(CacheServiceType);

  const cachePolicy = resources.find(({ entryId }) => entryId === resourceId);

  if (!cachePolicy?.result?.policyId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'policyId');
  }

  return cachePolicy.result.policyId;
};
