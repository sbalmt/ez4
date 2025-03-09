import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { DistributionState } from './types.js';

import { getEntry, EntryNotFoundError } from '@ez4/stateful';
import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { DistributionServiceType } from './types.js';

export const createDistributionStateId = (distributionName: string) => {
  return hashData(DistributionServiceType, toKebabCase(distributionName));
};

export const isDistributionState = (resource: EntryState): resource is DistributionState => {
  return resource.type === DistributionServiceType;
};

export const getDistributionState = (state: EntryStates, distributionName: string) => {
  const resource = getEntry(state, createDistributionStateId(distributionName));

  if (!isDistributionState(resource)) {
    throw new EntryNotFoundError(resource.entryId);
  }

  return resource;
};

export const getDistributionId = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const resource = context
    .getDependencies<DistributionState>(DistributionServiceType)
    .at(0)?.result;

  if (!resource?.distributionId) {
    throw new IncompleteResourceError(serviceName, resourceId, 'distributionId');
  }

  return resource.distributionId;
};

export const getDistributionArn = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const resource = context
    .getDependencies<DistributionState>(DistributionServiceType)
    .at(0)?.result;

  if (!resource?.distributionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'distributionArn');
  }

  return resource.distributionArn;
};
