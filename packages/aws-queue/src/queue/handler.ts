import type { StepHandler } from '@ez4/stateful';
import type { QueueState, QueueResult, QueueParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  fetchQueue,
  createQueue,
  deleteQueue,
  tagQueue,
  untagQueue,
  updateQueue
} from './client.js';

import { QueueServiceName } from './types.js';

export const getQueueHandler = (): StepHandler<QueueState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: QueueState, current: QueueState) => {
  return !!candidate.result && candidate.result.queueUrl === current.result?.queueUrl;
};

const previewResource = async (candidate: QueueState, current: QueueState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.queueName
  };
};

const replaceResource = async (candidate: QueueState, current: QueueState) => {
  if (current.result) {
    throw new ReplaceResourceError(QueueServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: QueueState): Promise<QueueResult> => {
  const parameters = candidate.parameters;

  const { queueUrl, queueArn } = await (parameters.import
    ? fetchQueue(parameters.queueName)
    : createQueue(parameters));

  return {
    queueUrl,
    queueArn
  };
};

const updateResource = async (candidate: QueueState, current: QueueState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await checkGeneralUpdates(result.queueUrl, parameters, current.parameters);
    await checkTagUpdates(result.queueUrl, parameters, current.parameters);
  }
};

const deleteResource = async (candidate: QueueState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await deleteQueue(result.queueUrl);
  }
};

const checkGeneralUpdates = async (
  queueUrl: string,
  candidate: QueueParameters,
  current: QueueParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      queueName: true,
      tags: true
    }
  });

  if (hasChanges) {
    await updateQueue(queueUrl, candidate);
  }
};

const checkTagUpdates = async (
  queueUrl: string,
  candidate: QueueParameters,
  current: QueueParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagQueue(queueUrl, tags),
    (tags) => untagQueue(queueUrl, tags)
  );
};
