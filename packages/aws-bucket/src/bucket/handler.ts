import type { StepHandler } from '@ez4/stateful';
import type { ResourceTags } from '@ez4/aws-common';
import type { BucketState, BucketResult, BucketParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  createBucket,
  updateCorsConfiguration,
  createLifecycle,
  deleteBucket,
  deleteCorsConfiguration,
  deleteLifecycle,
  tagBucket
} from './client.js';

import { BucketServiceName } from './types.js';

export const getBucketHandler = (): StepHandler<BucketState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: BucketState, current: BucketState) => {
  return !!candidate.result && candidate.result.bucketName === current.result?.bucketName;
};

const previewResource = async (candidate: BucketState, current: BucketState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.bucketName
  };
};

const replaceResource = async (candidate: BucketState, current: BucketState) => {
  if (current.result) {
    throw new ReplaceResourceError(BucketServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: BucketState): Promise<BucketResult> => {
  const parameters = candidate.parameters;

  const { bucketName } = await createBucket(parameters);

  await checkCorsUpdates(bucketName, parameters, undefined);
  await checkLifecycleUpdates(bucketName, parameters, undefined);
  await checkTagUpdates(bucketName, parameters.tags, undefined);

  return {
    bucketName
  };
};

const updateResource = async (candidate: BucketState, current: BucketState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const bucketName = result.bucketName;

  await checkCorsUpdates(bucketName, parameters, current.parameters);
  await checkLifecycleUpdates(bucketName, parameters, current.parameters);
  await checkTagUpdates(bucketName, parameters.tags, current.parameters.tags);
};

const deleteResource = async (candidate: BucketState) => {
  const result = candidate.result;

  if (result) {
    await deleteBucket(result.bucketName);
  }
};

const checkCorsUpdates = async (
  bucketName: string,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.cors && current?.cors && deepEqual(candidate.cors, current.cors)) {
    return;
  }

  if (candidate.cors) {
    return updateCorsConfiguration(bucketName, candidate.cors);
  }

  if (current?.cors) {
    return deleteCorsConfiguration(bucketName);
  }
};

const checkLifecycleUpdates = async (
  bucketName: string,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.autoExpireDays === current?.autoExpireDays) {
    return;
  }

  if (candidate.autoExpireDays) {
    return createLifecycle(bucketName, candidate.autoExpireDays);
  }

  if (current?.autoExpireDays) {
    return deleteLifecycle(bucketName);
  }
};

const checkTagUpdates = async (
  bucketName: string,
  candidate: ResourceTags | undefined,
  current: ResourceTags | undefined
) => {
  const newTags = candidate ?? {};
  const hasChanges = !deepEqual(newTags, current ?? {});

  if (hasChanges) {
    await tagBucket(bucketName, newTags);
  }
};
