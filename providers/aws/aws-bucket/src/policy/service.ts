import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketState } from '../bucket/types';
import type { PolicyParameters, PolicyState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { PolicyServiceType } from './types';

export const createBucketPolicy = <E extends EntryState>(
  state: EntryStates<E>,
  sourceState: EntryState,
  bucketState: BucketState,
  parameters: PolicyParameters
) => {
  const policyId = hashData(PolicyServiceType, sourceState.entryId, bucketState.entryId);

  return attachEntry<E | PolicyState, PolicyState>(state, {
    type: PolicyServiceType,
    entryId: policyId,
    dependencies: [sourceState.entryId, bucketState.entryId],
    parameters
  });
};
