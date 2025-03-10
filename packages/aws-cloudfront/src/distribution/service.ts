import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateState } from '@ez4/aws-certificate';
import type { DistributionParameters, DistributionState } from './types.js';

import { attachEntry, linkDependency, tryLinkDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { OriginState } from '../origin/types.js';
import { AccessState } from '../access/types.js';
import { DistributionServiceType } from './types.js';
import { createDistributionStateId } from './utils.js';

export const createDistribution = <E extends EntryState>(
  state: EntryStates<E>,
  accessState: AccessState,
  originState: OriginState,
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

  linkDependency(state, resource.entryId, parameters.defaultOrigin.cachePolicyId);

  parameters.origins?.forEach(({ cachePolicyId }) => {
    tryLinkDependency(state, resource.entryId, cachePolicyId);
  });

  return resource;
};
