import type { EntryState, EntryStates } from '@ez4/stateful';
import type { DistributionParameters, DistributionState } from './types.js';

import { toKebabCase } from '@ez4/utils';
import { attachEntry, linkDependency } from '@ez4/stateful';

import { AccessState } from '../access/types.js';
import { DistributionServiceType } from './types.js';
import { getDistributionStateId } from './utils.js';

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  accessState: AccessState,
  parameters: DistributionParameters
) => {
  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = getDistributionStateId(distributionName);

  const resource = attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies: [accessState.entryId],
    parameters: {
      ...parameters,
      distributionName
    }
  });

  linkDependency(state, resource.entryId, parameters.defaultOrigin.cachePolicyId);

  parameters.origins?.forEach(({ cachePolicyId }) => {
    if (!resource.dependencies.includes(cachePolicyId)) {
      linkDependency(state, resource.entryId, cachePolicyId);
    }
  });

  return resource;
};
