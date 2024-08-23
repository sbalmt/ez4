import type { StepContext, StepHandler } from '@ez4/stateful';
import type { ObjectState, ObjectResult, ObjectParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { putObject, deleteObject, tagObject } from './client.js';
import { getBucketName, getObjectKey } from './utils.js';
import { ObjectServiceName } from './types.js';

export const getObjectHandler = (): StepHandler<ObjectState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: ObjectState, current: ObjectState) => {
  return !!candidate.result && candidate.result.objectKey === current.result?.objectKey;
};

const previewResource = async (candidate: ObjectState, current: ObjectState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: getObjectKey(target)
  };
};

const replaceResource = async (
  candidate: ObjectState,
  current: ObjectState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(ObjectServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: ObjectState,
  context: StepContext
): Promise<ObjectResult> => {
  const parameters = candidate.parameters;

  const bucketName = getBucketName('bucket', context);
  const objectKey = getObjectKey(parameters);

  const response = await putObject(bucketName, {
    ...parameters,
    objectKey
  });

  await checkTagUpdates(bucketName, objectKey, parameters);

  return {
    bucketName: bucketName,
    objectKey: response.objectKey,
    etag: response.etag
  };
};

const updateResource = async (
  candidate: ObjectState,
  current: ObjectState
): Promise<ObjectResult | undefined> => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const objectKey = getObjectKey(candidate.parameters);
  const bucketName = result.bucketName;

  if (current.result) {
    return await checkObjectUpdates(bucketName, objectKey, candidate.parameters, current.result);
  }

  await checkTagUpdates(bucketName, objectKey, candidate.parameters);

  return result;
};

const deleteResource = async (candidate: ObjectState) => {
  const result = candidate.result;

  if (result) {
    await deleteObject(result.bucketName, result.objectKey);
  }
};

const checkObjectUpdates = async (
  bucketName: string,
  objectKey: string,
  candidate: ObjectParameters,
  current: ObjectResult
) => {
  if (objectKey === current.objectKey) {
    return;
  }

  await deleteObject(bucketName, current.objectKey);

  const response = await putObject(bucketName, {
    ...candidate,
    objectKey
  });

  return {
    bucketName,
    objectKey: response.objectKey,
    etag: response.etag
  };
};

const checkTagUpdates = async (
  bucketName: string,
  objectKey: string,
  candidate: ObjectParameters
) => {
  await tagObject(bucketName, objectKey, candidate.tags ?? {});
};
