import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketParameters, BucketState } from './types';

import { attachEntry } from '@ez4/stateful';

import { createBucketStateId } from './utils';
import { BucketServiceType } from './types';

export const createBucket = <E extends EntryState>(state: EntryStates<E>, parameters: BucketParameters) => {
  const bucketName = parameters.bucketName;
  const entryId = createBucketStateId(bucketName);

  return attachEntry<E | BucketState, BucketState>(state, {
    type: BucketServiceType,
    entryId,
    dependencies: [],
    parameters
  });
};
