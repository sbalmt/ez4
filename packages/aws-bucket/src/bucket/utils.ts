import type { EntryState, StepContext } from '@ez4/stateful';
import type { BucketState } from './types.js';

import { hashData, toKebabCase } from '@ez4/utils';
import { IncompleteResourceError } from '@ez4/aws-common';
import { getRegion } from '@ez4/aws-identity';

import { BucketServiceType } from './types.js';

export const getBucketHashId = (bucketName: string) => {
  return hashData(BucketServiceType, toKebabCase(bucketName));
};

export const getBucketDomain = async (bucketName: string) => {
  const region = await getRegion();

  return `${bucketName}.s3.${region}.amazonaws.com`;
};

export const getBucketName = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | BucketState>
) => {
  const resource = context.getDependencies(BucketServiceType).at(0)?.result;

  if (!resource?.bucketName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'bucketName');
  }

  return resource.bucketName;
};
