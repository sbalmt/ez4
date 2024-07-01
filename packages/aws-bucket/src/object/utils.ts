import type { EntryState, StepContext } from '@ez4/stateful';
import type { ObjectParameters } from './types.js';

import { basename } from 'node:path';

import { IncompleteResourceError } from '@ez4/aws-common';

import { BucketServiceType, BucketState } from '../bucket/types.js';
import { ObjectServiceName } from './types.js';

export const getObjectKey = (parameters: ObjectParameters) => {
  return parameters.objectKey ?? basename(parameters.filePath);
};

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
