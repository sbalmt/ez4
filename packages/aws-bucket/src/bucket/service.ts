import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketParameters, BucketState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { BucketServiceType } from './types.js';

export const isBucket = (resource: EntryState): resource is BucketState => {
  return resource.type === BucketServiceType;
};

export const createBucket = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: BucketParameters
) => {
  const bucketName = toKebabCase(parameters.bucketName);
  const bucketId = hashData(BucketServiceType, bucketName);

  return attachEntry<E | BucketState, BucketState>(state, {
    type: BucketServiceType,
    entryId: bucketId,
    dependencies: [],
    parameters: {
      ...parameters,
      bucketName
    }
  });
};
