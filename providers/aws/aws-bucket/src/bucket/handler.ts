import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { BucketState, BucketResult, BucketParameters } from './types';

import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { tryGetFunctionArn } from '@ez4/aws-function';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  isBucketEmpty,
  createBucket,
  deleteBucket,
  updateCorsConfiguration,
  deleteCorsConfiguration,
  updateEventNotifications,
  createLifecycle,
  deleteLifecycle,
  tagBucket
} from './client';

import { BucketServiceName } from './types';

type NotificationParameters = {
  functionArn?: Arn;
  eventsPath?: string;
};

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

const previewResource = (candidate: BucketState, current: BucketState) => {
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

const replaceResource = async (candidate: BucketState, current: BucketState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(BucketServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: BucketState, context: StepContext): Promise<BucketResult> => {
  const parameters = candidate.parameters;

  const functionArn = tryGetFunctionArn(context);

  return Logger.logOperation(BucketServiceName, parameters.bucketName, 'creation', async (logger) => {
    const { bucketName } = await createBucket(logger, parameters);

    await checkCorsUpdates(logger, bucketName, parameters, undefined);
    await checkLifecycleUpdates(logger, bucketName, parameters, undefined);
    await checkTagUpdates(logger, bucketName, parameters.tags, undefined);

    const request = {
      eventsPath: parameters.eventsPath,
      functionArn
    };

    await checkEventUpdates(logger, bucketName, request, {});

    return {
      bucketName,
      functionArn
    };
  });
};

const updateResource = (candidate: BucketState, current: BucketState, context: StepContext): Promise<BucketResult> => {
  const { result, parameters } = candidate;
  const { bucketName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(BucketServiceName, bucketName);
  }

  return Logger.logOperation(BucketServiceName, bucketName, 'updates', async (logger) => {
    const newFunctionArn = tryGetFunctionArn(context);
    const oldFunctionArn = current.result?.functionArn;

    await checkCorsUpdates(logger, bucketName, parameters, current.parameters);
    await checkLifecycleUpdates(logger, bucketName, parameters, current.parameters);
    await checkTagUpdates(logger, bucketName, parameters.tags, current.parameters.tags);

    const newRequest = { eventsPath: parameters.eventsPath, functionArn: newFunctionArn };
    const oldRequest = { eventsPath: current.parameters.eventsPath, functionArn: oldFunctionArn };

    await checkEventUpdates(logger, bucketName, newRequest, oldRequest);

    return {
      ...result,
      functionArn: newFunctionArn
    };
  });
};

const deleteResource = async (current: BucketState) => {
  const result = current.result;

  if (!result) {
    return;
  }

  const { bucketName } = result;

  await Logger.logOperation(BucketServiceName, bucketName, 'deletion', async (logger) => {
    const isEmpty = await isBucketEmpty(logger, result.bucketName);

    if (isEmpty) {
      await deleteBucket(logger, result.bucketName);
    }
  });
};

const checkCorsUpdates = async (
  logger: Logger.OperationLogger,
  bucketName: string,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.cors && current?.cors && deepEqual(candidate.cors, current.cors)) {
    return;
  }

  if (candidate.cors) {
    return updateCorsConfiguration(logger, bucketName, candidate.cors);
  }

  if (current?.cors) {
    return deleteCorsConfiguration(logger, bucketName);
  }
};

const checkLifecycleUpdates = async (
  logger: Logger.OperationLogger,
  bucketName: string,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.autoExpireDays === current?.autoExpireDays) {
    return;
  }

  if (candidate.autoExpireDays) {
    return createLifecycle(logger, bucketName, candidate.autoExpireDays);
  }

  if (current?.autoExpireDays) {
    return deleteLifecycle(logger, bucketName);
  }
};

const checkTagUpdates = async (
  logger: Logger.OperationLogger,
  bucketName: string,
  candidate: ResourceTags | undefined,
  current: ResourceTags | undefined
) => {
  const newTags = candidate ?? {};
  const hasChanges = !deepEqual(newTags, current ?? {});

  if (hasChanges) {
    await tagBucket(logger, bucketName, newTags);
  }
};

const checkEventUpdates = async (
  logger: Logger.OperationLogger,
  bucketName: string,
  candidate: NotificationParameters,
  current: NotificationParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateEventNotifications(logger, bucketName, {
      eventsType: ['s3:ObjectCreated:*', 's3:ObjectRemoved:*'],
      ...candidate
    });
  }
};
