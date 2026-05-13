import type { StepContext, StepHandler } from '@ez4/stateful';
import type { BucketEventState, BucketEventResult } from './types';

import { OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { attachEventNotifications, detachEventNotifications } from './client';

import { getBucketName } from '../bucket/utils';
import { BucketEventServiceName } from './types';

export const getBucketEventHandler = (): StepHandler<BucketEventState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: BucketEventState, current: BucketEventState) => {
  return !!candidate.result && candidate.result.bucketName === current.result?.bucketName;
};

const previewResource = (candidate: BucketEventState, current: BucketEventState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      eventGetters: true
    }
  });

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.toService
  };
};

const replaceResource = async (candidate: BucketEventState, current: BucketEventState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(BucketEventServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: BucketEventState, context: StepContext): Promise<BucketEventResult> => {
  const { parameters } = candidate;

  const bucketName = getBucketName(BucketEventServiceName, 'bucket', context);

  return OperationLogger.logExecution(BucketEventServiceName, bucketName, 'creation', async (logger) => {
    const events = await Promise.all(parameters.eventGetters.map((getEvent) => getEvent(context)));

    const { functionArns } = await attachEventNotifications(logger, bucketName, events);

    return {
      functionArns,
      bucketName
    };
  });
};

const updateResource = (candidate: BucketEventState, _current: BucketEventState, context: StepContext): Promise<BucketEventResult> => {
  const { parameters } = candidate;

  const bucketName = getBucketName(BucketEventServiceName, 'bucket', context);

  return OperationLogger.logExecution(BucketEventServiceName, bucketName, 'updates', async (logger) => {
    const events = await Promise.all(parameters.eventGetters.map((getEvent) => getEvent(context)));

    const { functionArns } = await attachEventNotifications(logger, bucketName, events);

    return {
      functionArns,
      bucketName
    };
  });
};

const deleteResource = async (current: BucketEventState) => {
  const { result } = current;

  if (result) {
    const { bucketName } = result;

    await OperationLogger.logExecution(BucketEventServiceName, bucketName, 'deletion', async (logger) => {
      await detachEventNotifications(logger, bucketName);
    });
  }
};
