import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { BucketState } from './types.js';

import { EntryNotFoundError, getEntry } from '@ez4/stateful';
import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { BucketServiceType } from './types.js';

export const isBucketState = (resource: EntryState): resource is BucketState => {
  return resource.type === BucketServiceType;
};

export const getBucketStateId = (bucketName: string) => {
  return hashData(BucketServiceType, toKebabCase(bucketName));
};

export const getBucketState = (state: EntryStates, bucketName: string) => {
  const resource = getEntry(state, getBucketStateId(bucketName));

  if (!isBucketState(resource)) {
    throw new EntryNotFoundError(resource.entryId);
  }

  return resource;
};

export const getBucketName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<BucketState>(BucketServiceType).at(0)?.result;

  if (!resource?.bucketName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'bucketName');
  }

  return resource.bucketName;
};
