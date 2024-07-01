import type { StepHandler } from '@ez4/stateful';
import type { BucketState, BucketResult, BucketParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';

import { createBucket, deleteBucket, tagBucket } from './client.js';
import { BucketServiceName } from './types.js';

export const getBucketHandler = (): StepHandler<BucketState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: BucketState, current: BucketState) => {
  return !!candidate.result && candidate.result.bucketName === current.result?.bucketName;
};

const replaceResource = async (candidate: BucketState, current: BucketState) => {
  if (current.result) {
    throw new ReplaceResourceError(BucketServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: BucketState): Promise<BucketResult> => {
  const parameters = candidate.parameters;

  const response = await createBucket(parameters);

  await checkTagUpdates(response.bucketName, parameters);

  return {
    bucketName: response.bucketName,
    location: response.location
  };
};

const updateResource = async (candidate: BucketState, _current: BucketState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  await checkTagUpdates(result.bucketName, candidate.parameters);
};

const deleteResource = async (candidate: BucketState) => {
  const result = candidate.result;

  if (result) {
    await deleteBucket(result.bucketName);
  }
};

const checkTagUpdates = async (bucketName: string, candidate: BucketParameters) => {
  await tagBucket(bucketName, candidate.tags ?? {});
};
