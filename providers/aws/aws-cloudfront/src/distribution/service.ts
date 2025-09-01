import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateState } from '@ez4/aws-certificate';
import type { AccessState } from '../access/types';
import type { OriginState } from '../origin/types';
import type { CacheState } from '../cache/types';
import type { DistributionParameters, DistributionState } from './types';

import { attachEntry } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { createDistributionStateId } from './utils';
import { DistributionServiceType } from './types';

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

  const dependencies = [accessState.entryId, originState.entryId, ...cacheStates.map(({ entryId }) => entryId)];

  if (certificateState) {
    dependencies.push(certificateState.entryId);
  }

  return attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies,
    parameters: {
      ...parameters,
      distributionName
    }
  });
};
