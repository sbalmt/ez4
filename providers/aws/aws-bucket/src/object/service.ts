import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketState } from '../bucket/types';
import type { ObjectParameters, ObjectState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { ObjectServiceType } from './types';

export const createBucketObject = <E extends EntryState>(state: EntryStates<E>, bucketState: BucketState, parameters: ObjectParameters) => {
  const objectKey = parameters.objectKey;
  const objectId = hashData(ObjectServiceType, bucketState.entryId, objectKey);

  return attachEntry<E | ObjectState, ObjectState>(state, {
    type: ObjectServiceType,
    entryId: objectId,
    dependencies: [bucketState.entryId],
    parameters
  });
};
