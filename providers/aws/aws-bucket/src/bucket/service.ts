import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { BucketParameters, BucketState } from './types.js';

import { createPermission } from '@ez4/aws-function';
import { attachEntry, linkDependency } from '@ez4/stateful';

import { buildBucketArn } from '../utils/policy.js';
import { createBucketStateId } from './utils.js';
import { BucketServiceType } from './types.js';

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

    linkDependency(state, bucketState.entryId, functionState.entryId);
  }

  return bucketState;
};
