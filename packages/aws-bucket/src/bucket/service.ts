import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { BucketParameters, BucketState } from './types.js';

import { createPermission } from '@ez4/aws-function';
import { attachEntry, linkDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { buildBucketArn } from '../utils/policy.js';
import { BucketServiceType } from './types.js';
import { getBucketStateId } from './utils.js';

export const createBucket = <E extends EntryState>(
  state: EntryStates<E>,
  functionState: FunctionState | undefined,
  parameters: BucketParameters
) => {
  const bucketName = toKebabCase(parameters.bucketName);
  const bucketId = getBucketStateId(parameters.bucketName);

  const bucketState = attachEntry<E | BucketState, BucketState>(state, {
    type: BucketServiceType,
    entryId: bucketId,
    dependencies: [],
    parameters: {
      ...parameters,
      bucketName
    }
  });

  if (functionState) {
    createPermission(state, bucketState, functionState, {
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
