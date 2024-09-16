import type { EntryState, StepContext } from '@ez4/stateful';
import type { DistributionState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { DistributionServiceType } from './types.js';

export const getDistributionHashId = (distributionName: string) => {
  return hashData(DistributionServiceType, toKebabCase(distributionName));
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
