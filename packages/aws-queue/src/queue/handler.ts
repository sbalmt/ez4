import type { StepHandler } from '@ez4/stateful';
import type { QueueState, QueueResult, QueueParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';

import { createQueue, deleteQueue, tagQueue, untagQueue } from './client.js';
import { QueueServiceName } from './types.js';

export const getQueueHandler = (): StepHandler<QueueState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: QueueState, current: QueueState) => {
  return !!candidate.result && candidate.result.queueUrl === current.result?.queueUrl;
};

const replaceResource = async (candidate: QueueState, current: QueueState) => {
  if (current.result) {
    throw new ReplaceResourceError(QueueServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: QueueState): Promise<QueueResult> => {
  const response = await createQueue(candidate.parameters);

  return {
    queueUrl: response.queueUrl,
    queueArn: response.queueArn
  };
};

const updateResource = async (candidate: QueueState, current: QueueState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  await checkTagUpdates(result.queueUrl, candidate.parameters, current.parameters);
};

const deleteResource = async (candidate: QueueState) => {
  const result = candidate.result;

  if (result) {
    await deleteQueue(result.queueUrl);
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
