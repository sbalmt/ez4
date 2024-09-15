import type { EntryState, EntryStates } from '@ez4/stateful';
import type { DistributionParameters, DistributionState } from './types.js';

import { toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { AccessState } from '../access/types.js';
import { DistributionServiceType } from './types.js';
import { getDistributionId } from './utils.js';

export const isDistribution = (resource: EntryState): resource is DistributionState => {
  return resource.type === DistributionServiceType;
};

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  accessState: AccessState,
  parameters: DistributionParameters
) => {
  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = getDistributionId(distributionName);

  return attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies: [accessState.entryId],
    parameters: {
      ...parameters,
      distributionName
    }
  });
};
