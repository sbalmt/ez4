import type { StepContext, StepHandler } from '@ez4/stateful';
import type { ResourceTags } from '@ez4/aws-common';
import type { ObjectState, ObjectResult, ObjectParameters } from './types';

import { stat } from 'node:fs/promises';

import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getBucketName } from '../bucket/utils';
import { putObject, deleteObject, updateTags } from './client';
import { getBucketObjectPath } from './utils';
import { ObjectServiceName } from './types';

export const getObjectHandler = (): StepHandler<ObjectState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: ObjectState, current: ObjectState) => {
  return !!candidate.result && candidate.result.lastModified === current.result?.lastModified;
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

const replaceResource = async (candidate: ObjectState, current: ObjectState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(ObjectServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: ObjectState, context: StepContext): Promise<ObjectResult> => {
  const parameters = candidate.parameters;

  const bucketName = getBucketName(ObjectServiceName, 'bucket', context);
  const objectName = getBucketObjectPath(bucketName, parameters.objectKey);

  return Logger.logOperation(ObjectServiceName, objectName, 'creation', async (logger) => {
    const lastModified = await getLastModifiedTime(parameters.filePath);

    const { objectKey } = await putObject(logger, bucketName, parameters);

    await checkTagUpdates(logger, bucketName, objectKey, parameters.tags, candidate.parameters.tags);

    return {
      lastModified,
      bucketName
    };
  });
};

const updateResource = (candidate: ObjectState, current: ObjectState): Promise<ObjectResult> => {
  const { result, parameters } = candidate;
  const { objectKey, tags } = parameters;

  if (!result) {
    throw new CorruptedResourceError(ObjectServiceName, objectKey);
  }

  const objectName = getBucketObjectPath(result.bucketName, objectKey);

  return Logger.logOperation(ObjectServiceName, objectName, 'updates', async (logger) => {
    const newResult = checkObjectUpdates(logger, result, parameters, current.parameters);

    await checkTagUpdates(logger, result.bucketName, objectKey, tags, current.parameters.tags);

    return newResult;
  });
};

const deleteResource = async (current: ObjectState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const objectName = getBucketObjectPath(result.bucketName, parameters.objectKey);

  await Logger.logOperation(ObjectServiceName, objectName, 'deletion', async (logger) => {
    await deleteObject(logger, result.bucketName, parameters.objectKey);
  });
};

const getLastModifiedTime = async (filePath: string) => {
  const { mtime } = await stat(filePath);

  return mtime.getTime();
};

const checkObjectUpdates = async (
  logger: Logger.OperationLogger,
  result: ObjectResult,
  candidate: ObjectParameters,
  current: ObjectParameters
) => {
  const lastModified = await getLastModifiedTime(candidate.filePath);

  if (lastModified <= result.lastModified && candidate.filePath === current.filePath) {
    return result;
  }

  const { bucketName } = result;

  const { objectKey } = current;

  await putObject(logger, bucketName, {
    ...candidate,
    objectKey
  });

  return {
    lastModified,
    bucketName
  };
};

const checkTagUpdates = async (
  logger: Logger.OperationLogger,
  bucketName: string,
  objectKey: string,
  candidate: ResourceTags | undefined,
  current: ResourceTags | undefined
) => {
  const newTags = candidate ?? {};
  const hasChanges = !deepEqual(newTags, current ?? {});

  if (hasChanges) {
    await updateTags(logger, bucketName, objectKey, newTags);
  }
};
