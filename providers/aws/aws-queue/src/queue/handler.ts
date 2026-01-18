import type { StepContext, StepHandler } from '@ez4/stateful';
import type { QueueState, QueueResult, QueueParameters } from './types';
import type { CreateRequest, DeadLetter, UpdateRequest } from './client';

import { applyTagUpdates, CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { fetchQueue, createQueue, deleteQueue, tagQueue, untagQueue, updateQueue } from './client';
import { QueueServiceName } from './types';
import { getQueueArn } from './utils';

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

const previewResource = (candidate: QueueState, current: QueueState) => {
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

  return Logger.logOperation(QueueServiceName, parameters.queueName, 'creation', async (logger) => {
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
      const { queueUrl } = await fetchQueue(logger, parameters.queueName);

      await updateQueue(logger, queueUrl, request);

      return {
        deadLetterArn,
        queueUrl
      };
    }

    const { queueUrl } = await createQueue(logger, request);

    return {
      deadLetterArn,
      queueUrl
    };
  });
};

const updateResource = (candidate: QueueState, current: QueueState, context: StepContext): Promise<QueueResult> => {
  const { result, parameters } = candidate;
  const { queueName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(QueueServiceName, queueName);
  }

  if (parameters.import) {
    return Promise.resolve(result);
  }

  return Logger.logOperation(QueueServiceName, queueName, 'updates', async (logger) => {
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

    await checkGeneralUpdates(logger, result.queueUrl, newRequest, oldRequest);
    await checkTagUpdates(logger, result.queueUrl, parameters, current.parameters);

    return {
      ...result,
      deadLetterArn: newDeadLetterArn
    };
  });
};

const deleteResource = async (current: QueueState) => {
  const { result, parameters } = current;

  if (!result || parameters.import) {
    return;
  }

  return Logger.logOperation(QueueServiceName, parameters.queueName, 'deletion', async (logger) => {
    await deleteQueue(logger, result.queueUrl);
  });
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  queueUrl: string,
  candidate: GeneralUpdateParameters,
  current: GeneralUpdateParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      queueName: true,
      tags: true
    }
  });

  if (hasChanges) {
    await updateQueue(logger, queueUrl, candidate);
  }
};

const checkTagUpdates = async (logger: Logger.OperationLogger, queueUrl: string, candidate: QueueParameters, current: QueueParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagQueue(logger, queueUrl, tags),
    (tags) => untagQueue(logger, queueUrl, tags)
  );
};
