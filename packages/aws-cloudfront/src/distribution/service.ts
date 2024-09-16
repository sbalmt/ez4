import type { EntryState, EntryStates } from '@ez4/stateful';
import type { DistributionParameters, DistributionState } from './types.js';

import { toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { AccessState } from '../access/types.js';
import { PolicyState } from '../policy/types.js';
import { DistributionServiceType } from './types.js';
import { getDistributionStateId } from './utils.js';

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  accessState: AccessState,
  policyState: PolicyState,
  parameters: DistributionParameters
) => {
  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = getDistributionStateId(distributionName);

  return attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies: [accessState.entryId, policyState.entryId],
    parameters: {
      ...parameters,
      distributionName
    }
  });
};
