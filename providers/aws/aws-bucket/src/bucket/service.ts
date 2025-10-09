import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { BucketParameters, BucketState } from './types';

import { attachEntry, linkEntryDependency } from '@ez4/stateful';
import { createPermission } from '@ez4/aws-function';

import { buildBucketArn } from '../utils/policy';
import { createBucketStateId } from './utils';
import { BucketServiceType } from './types';

export const createBucket = <E extends EntryState>(
  state: EntryStates<E>,
  functionState: FunctionState | undefined,
  parameters: BucketParameters
) => {
  const bucketName = parameters.bucketName;
  const entryId = createBucketStateId(bucketName);

  const bucketState = attachEntry<E | BucketState, BucketState>(state, {
    type: BucketServiceType,
    entryId,
    dependencies: [],
    parameters
  });

  if (functionState) {
    createPermission(state, bucketState, functionState, {
      fromService: parameters.bucketName,
      getPermission: () => {
        return {
          principal: 's3.amazonaws.com',
          sourceArn: buildBucketArn(bucketName)
        };
      }
    });

    linkEntryDependency(state, bucketState.entryId, functionState.entryId);
  }

  return bucketState;
};
