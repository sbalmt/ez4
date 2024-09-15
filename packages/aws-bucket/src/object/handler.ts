import type { StepContext, StepHandler } from '@ez4/stateful';
import type { ObjectState, ObjectResult, ObjectParameters } from './types.js';

import { statSync } from 'node:fs';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { putObject, deleteObject, tagObject } from './client.js';
import { ObjectServiceName } from './types.js';
import { getBucketName } from './utils.js';

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
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      dependencies: candidate.dependencies,
      lastModified: getLastModifiedTime(target.filePath)
    },
    {
      ...source,
      dependencies: current.dependencies,
      lastModified: candidate.result?.lastModified
    }
  );

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.objectKey
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

  const { objectKey } = await putObject(bucketName, parameters);

  await checkTagUpdates(bucketName, objectKey, parameters);

  return {
    lastModified: getLastModifiedTime(parameters.filePath),
    bucketName,
    objectKey
  };
};

const updateResource = async (
  candidate: ObjectState,
  current: ObjectState
): Promise<ObjectResult | undefined> => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { bucketName, objectKey } = result;

  const newResult = checkObjectUpdates(result, parameters, current.parameters);

  await checkTagUpdates(bucketName, objectKey, parameters);

  return newResult;
};

const deleteResource = async (candidate: ObjectState) => {
  const result = candidate.result;

  if (result) {
    await deleteObject(result.bucketName, result.objectKey);
  }
};

const getLastModifiedTime = (filePath: string) => {
  const fileStat = statSync(filePath);
  const lastModified = fileStat.mtime.getTime();

  return lastModified;
};

const checkObjectUpdates = async (
  result: ObjectResult,
  candidate: ObjectParameters,
  current: ObjectParameters
) => {
  const lastModified = getLastModifiedTime(candidate.filePath);

  if (lastModified <= result.lastModified && candidate.filePath === current.filePath) {
    return result;
  }

  const { bucketName, objectKey } = result;

  await putObject(bucketName, {
    ...candidate,
    objectKey
  });

  return {
    lastModified,
    bucketName,
    objectKey
  };
};

const checkTagUpdates = async (
  bucketName: string,
  objectKey: string,
  candidate: ObjectParameters
) => {
  await tagObject(bucketName, objectKey, candidate.tags ?? {});
};
