import type { StepContext, StepHandler } from '@ez4/stateful';
import type { QueueState, QueueResult, QueueParameters } from './types.js';
import type { CreateRequest, DeadLetter, UpdateRequest } from './client.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { fetchQueue, createQueue, deleteQueue, tagQueue, untagQueue, updateQueue } from './client.js';
import { QueueServiceName } from './types.js';
import { getQueueArn } from './utils.js';

type GeneralUpdateParameters = CreateRequest & UpdateRequest;

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

const replaceResource = async (candidate: QueueState, current: QueueState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(QueueServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: QueueState, context: StepContext): Promise<QueueResult> => {
  const { deadLetter, ...parameters } = candidate.parameters;

  const deadLetterArn = deadLetter && getQueueArn(QueueServiceName, 'dead-letter', context);

  const request = {
    ...parameters,
    ...(deadLetterArn && {
      deadLetter: {
        ...deadLetter,
        targetQueueArn: deadLetterArn
      }
    })
  };

  if (parameters.import) {
    const { queueUrl } = await fetchQueue(parameters.queueName);

    await updateQueue(queueUrl, request);

    return {
      deadLetterArn,
      queueUrl
    };
  }

  const { queueUrl } = await createQueue(request);

  return {
    deadLetterArn,
    queueUrl
  };
};

const updateResource = async (candidate: QueueState, current: QueueState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result || parameters.import) {
    return;
  }

  const { deadLetter: newDeadLetter, ...newParameters } = candidate.parameters;
  const { deadLetter: oldDeadLetter, ...oldParameters } = current.parameters;

  const newDeadLetterArn = newDeadLetter && getQueueArn(QueueServiceName, 'dead-letter', context);
  const oldDeadLetterArn = oldDeadLetter && current.result?.deadLetterArn;

  const newRequest = {
    ...newParameters,
    ...(newDeadLetterArn && {
      deadLetter: {
        ...newDeadLetter,
        targetQueueArn: newDeadLetterArn
      } as DeadLetter
    })
  };

  const oldRequest = {
    ...oldParameters,
    ...(oldDeadLetterArn && {
      deadLetter: {
        ...oldDeadLetter,
        targetQueueArn: oldDeadLetterArn
      }
    })
  };

  await checkGeneralUpdates(result.queueUrl, newRequest, oldRequest);
  await checkTagUpdates(result.queueUrl, parameters, current.parameters);

  return {
    ...result,
    deadLetterArn: newDeadLetterArn
  };
};

const deleteResource = async (candidate: QueueState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await deleteQueue(result.queueUrl);
  }
};

const checkGeneralUpdates = async (queueUrl: string, candidate: GeneralUpdateParameters, current: GeneralUpdateParameters) => {
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

const checkTagUpdates = async (queueUrl: string, candidate: QueueParameters, current: QueueParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagQueue(queueUrl, tags),
    (tags) => untagQueue(queueUrl, tags)
  );
};
