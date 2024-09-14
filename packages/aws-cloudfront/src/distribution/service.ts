import type { EntryState, EntryStates } from '@ez4/stateful';
import type { DistributionParameters, DistributionState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { DistributionServiceType } from './types.js';

export const isDistribution = (resource: EntryState): resource is DistributionState => {
  return resource.type === DistributionServiceType;
};

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: DistributionParameters
) => {
  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = hashData(DistributionServiceType, distributionName);

  return attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies: [],
    parameters: {
      ...parameters,
      distributionName
    }
  });
};
