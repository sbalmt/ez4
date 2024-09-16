import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { DistributionState } from './types.js';

import { getEntry, EntryNotFoundError } from '@ez4/stateful';
import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { DistributionServiceType } from './types.js';

export const isDistributionState = (resource: EntryState): resource is DistributionState => {
  return resource.type === DistributionServiceType;
};

export const getDistributionStateId = (distributionName: string) => {
  return hashData(DistributionServiceType, toKebabCase(distributionName));
};

export const getDistributionState = (state: EntryStates, distributionName: string) => {
  const resource = getEntry(state, getDistributionStateId(distributionName));

  if (!isDistributionState(resource)) {
    throw new EntryNotFoundError(resource.entryId);
  }

  return resource;
};

export const getDistributionId = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | DistributionState>
) => {
  const resource = context.getDependencies(DistributionServiceType).at(0)?.result;

  if (!resource?.distributionId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'distributionId');
  }

  return resource.distributionId;
};

export const getDistributionArn = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | DistributionState>
) => {
  const resource = context.getDependencies(DistributionServiceType).at(0)?.result;

  if (!resource?.distributionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'distributionArn');
  }

  return resource.distributionArn;
};
