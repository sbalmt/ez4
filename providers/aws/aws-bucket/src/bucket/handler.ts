import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { BucketState, BucketResult, BucketParameters } from './types';

import { Logger, ReplaceResourceError } from '@ez4/aws-common';
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

    await checkCorsUpdates(bucketName, logger, parameters, undefined);
    await checkLifecycleUpdates(bucketName, logger, parameters, undefined);
    await checkTagUpdates(bucketName, logger, parameters.tags, undefined);

    const request = {
      eventsPath: parameters.eventsPath,
      functionArn
    };

    await checkEventUpdates(bucketName, logger, request, {});

    return {
      bucketName,
      functionArn
    };
  });
};

const updateResource = (candidate: BucketState, current: BucketState, context: StepContext): Promise<BucketResult | undefined> => {
  const { result, parameters } = candidate;

  if (!result) {
    return Promise.resolve(undefined);
  }

  const bucketName = result.bucketName;

  return Logger.logOperation(BucketServiceName, bucketName, 'updates', async (logger) => {
    const newFunctionArn = tryGetFunctionArn(context);
    const oldFunctionArn = current.result?.functionArn;

    await checkCorsUpdates(bucketName, logger, parameters, current.parameters);
    await checkLifecycleUpdates(bucketName, logger, parameters, current.parameters);
    await checkTagUpdates(bucketName, logger, parameters.tags, current.parameters.tags);

    const newRequest = { eventsPath: parameters.eventsPath, functionArn: newFunctionArn };
    const oldRequest = { eventsPath: current.parameters.eventsPath, functionArn: oldFunctionArn };

    await checkEventUpdates(bucketName, logger, newRequest, oldRequest);

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
    const isEmpty = await isBucketEmpty(result.bucketName, logger);

    if (isEmpty) {
      await deleteBucket(result.bucketName, logger);
    }
  });
};

const checkCorsUpdates = async (
  bucketName: string,
  logger: Logger.OperationLogger,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.cors && current?.cors && deepEqual(candidate.cors, current.cors)) {
    return;
  }

  if (candidate.cors) {
    return updateCorsConfiguration(bucketName, logger, candidate.cors);
  }

  if (current?.cors) {
    return deleteCorsConfiguration(bucketName, logger);
  }
};

const checkLifecycleUpdates = async (
  bucketName: string,
  logger: Logger.OperationLogger,
  candidate: BucketParameters,
  current: BucketParameters | undefined
) => {
  if (candidate.autoExpireDays === current?.autoExpireDays) {
    return;
  }

  if (candidate.autoExpireDays) {
    return createLifecycle(bucketName, logger, candidate.autoExpireDays);
  }

  if (current?.autoExpireDays) {
    return deleteLifecycle(bucketName, logger);
  }
};

const checkTagUpdates = async (
  bucketName: string,
  logger: Logger.OperationLogger,
  candidate: ResourceTags | undefined,
  current: ResourceTags | undefined
) => {
  const newTags = candidate ?? {};
  const hasChanges = !deepEqual(newTags, current ?? {});

  if (hasChanges) {
    await tagBucket(bucketName, logger, newTags);
  }
};

const checkEventUpdates = async (
  bucketName: string,
  logger: Logger.OperationLogger,
  candidate: NotificationParameters,
  current: NotificationParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateEventNotifications(bucketName, logger, {
      eventsType: ['s3:ObjectCreated:*', 's3:ObjectRemoved:*'],
      ...candidate
    });
  }
};
