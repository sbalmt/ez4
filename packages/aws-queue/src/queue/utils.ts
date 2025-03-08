import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { QueueState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { queueUrlToArn } from '../utils/policy.js';
import { QueueServiceType } from './types.js';

export const createQueueStateId = (queueName: string, normalize = true) => {
  return hashData(QueueServiceType, normalize ? toKebabCase(queueName) : queueName);
};

export const isQueueState = (resource: EntryState): resource is QueueState => {
  return resource.type === QueueServiceType;
};

export const tryGetQueueState = (state: EntryStates, queueName: string, normalize = true) => {
  let queueState;

  if ((queueState = state[createQueueStateId(queueName, normalize)]) && isQueueState(queueState)) {
    return queueState;
  }

  if ((queueState = state[createQueueStateId(`${toKebabCase(queueName)}.fifo`, false)]) && isQueueState(queueState)) {
    return queueState;
  }

  return undefined;
};

export const getQueueUrl = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<QueueState>(QueueServiceType).at(0)?.result;

  if (!resource?.queueUrl) {
    throw new IncompleteResourceError(serviceName, resourceId, 'queueUrl');
  }

  return resource.queueUrl;
};

export const getQueueArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const queueUrl = getQueueUrl(serviceName, resourceId, context);

  return queueUrlToArn(queueUrl);
};
