import type { ResourceTags } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { ObjectState, ObjectResult, ObjectParameters } from './types.js';

import { stat } from 'node:fs/promises';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getBucketName } from '../bucket/utils.js';
import { putObject, deleteObject, tagObject } from './client.js';
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
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      dependencies: candidate.dependencies,
      lastModified: await getLastModifiedTime(target.filePath)
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

  const bucketName = getBucketName(ObjectServiceName, 'bucket', context);

  const lastModified = await getLastModifiedTime(parameters.filePath);

  const { objectKey } = await putObject(bucketName, parameters);

  await checkTagUpdates(bucketName, objectKey, parameters.tags, candidate.parameters.tags);

  return {
    lastModified,
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

  await checkTagUpdates(bucketName, objectKey, parameters.tags, current.parameters.tags);

  return newResult;
};

const deleteResource = async (candidate: ObjectState) => {
  const result = candidate.result;

  if (result) {
    await deleteObject(result.bucketName, result.objectKey);
  }
};

const getLastModifiedTime = async (filePath: string) => {
  const { mtime } = await stat(filePath);

  return mtime.getTime();
};

const checkObjectUpdates = async (
  result: ObjectResult,
  candidate: ObjectParameters,
  current: ObjectParameters
) => {
  const lastModified = await getLastModifiedTime(candidate.filePath);

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
  candidate: ResourceTags | undefined,
  current: ResourceTags | undefined
) => {
  const newTags = candidate ?? {};
  const hasChanges = !deepEqual(newTags, current ?? {});

  if (hasChanges) {
    await tagObject(bucketName, objectKey, newTags);
  }
};
