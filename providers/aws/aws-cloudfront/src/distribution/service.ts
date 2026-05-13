import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateState } from '@ez4/aws-certificate';
import type { FunctionState } from '../function/types';
import type { AccessState } from '../access/types';
import type { OriginState } from '../origin/types';
import type { CacheState } from '../cache/types';
import type { DistributionParameters, DistributionState } from './types';

import { attachEntry } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { createDistributionStateId } from './utils';
import { DistributionServiceType } from './types';

export type DistributionServiceParameters = DistributionParameters & {
  rewriteFunctionState?: FunctionState;
  certificateState?: CertificateState;
  originCacheStates: CacheState[];
  originAccessState: AccessState;
  originPolicyState: OriginState;
};

export const createDistribution = <E extends EntryState>(state: EntryStates<E>, parameters: DistributionServiceParameters) => {
  const { originAccessState, originPolicyState, originCacheStates, certificateState, rewriteFunctionState, ...stateParameters } =
    parameters;

  const distributionName = toKebabCase(parameters.distributionName);
  const distributionId = createDistributionStateId(distributionName);

  const dependencies = [originAccessState.entryId, originPolicyState.entryId, ...originCacheStates.map(({ entryId }) => entryId)];

  if (rewriteFunctionState) {
    dependencies.push(rewriteFunctionState.entryId);
  }

  if (certificateState) {
    dependencies.push(certificateState.entryId);
  }

  return attachEntry<E | DistributionState, DistributionState>(state, {
    type: DistributionServiceType,
    entryId: distributionId,
    dependencies,
    parameters: {
      ...stateParameters,
      distributionName
    }
  });
};
