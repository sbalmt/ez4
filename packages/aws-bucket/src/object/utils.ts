import type { EntryState, StepContext } from '@ez4/stateful';

import { IncompleteResourceError } from '@ez4/aws-common';

import { BucketServiceType, BucketState } from '../bucket/types.js';
import { ObjectServiceName } from './types.js';

export const getObjectPath = (bucketName: string, objectKey: string) => {
  return `${bucketName}/${objectKey}`;
};

export const getBucketName = <E extends EntryState>(
  resourceId: string,
  context: StepContext<E | BucketState>
) => {
  const resource = context.getDependencies(BucketServiceType).at(0)?.result;

  if (!resource?.bucketName) {
    throw new IncompleteResourceError(ObjectServiceName, resourceId, 'bucketName');
  }

  return resource.bucketName;
};
