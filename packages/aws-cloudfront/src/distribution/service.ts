import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateState } from '@ez4/aws-certificate';
import type { DistributionParameters, DistributionState } from './types.js';

import { attachEntry, linkDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { CacheState } from '../cache/types.js';
import { OriginState } from '../origin/types.js';
import { AccessState } from '../access/types.js';
import { createDistributionStateId } from './utils.js';
import { DistributionServiceType } from './types.js';

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  accessState: AccessState,
  originState: OriginState,
  cacheStates: CacheState[],
  certificateState: CertificateState | undefined,
  parameters: DistributionParameters
) => {
  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = createDistributionStateId(distributionName);
  const dependencies = [accessState.entryId, originState.entryId];

  if (certificateState) {
    dependencies.push(certificateState.entryId);
  }

  const resource = attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies,
    parameters: {
      ...parameters,
      distributionName
    }
  });

  cacheStates.forEach(({ entryId }) => {
    linkDependency(state, resource.entryId, entryId);
  });

  return resource;
};
