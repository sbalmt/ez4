import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { BucketState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { BucketNotFoundError } from './errors.js';
import { BucketServiceType } from './types.js';

export const createBucketStateId = (bucketName: string) => {
  return hashData(BucketServiceType, toKebabCase(bucketName));
};

export const isBucketState = (resource: EntryState): resource is BucketState => {
  return resource.type === BucketServiceType;
};

export const getBucketState = (context: EventContext, bucketName: string, options: DeployOptions) => {
  const bucketState = context.getServiceState(bucketName, options);

  if (!isBucketState(bucketState)) {
    throw new BucketNotFoundError(bucketName);
  }

  return bucketState;
};

export const getBucketName = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<BucketState>(BucketServiceType)[0]?.result;

  if (!resource?.bucketName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'bucketName');
  }

  return resource.bucketName;
};
