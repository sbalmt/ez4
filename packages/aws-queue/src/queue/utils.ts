import type { EntryState, EntryStates, StepContext } from '@ez4/stateful';
import type { QueueState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { EntryNotFoundError, getEntry } from '@ez4/stateful';
import { hashData, toKebabCase } from '@ez4/utils';

import { queueUrlToArn } from '../utils/policy.js';
import { QueueServiceType } from './types.js';

export const createQueueStateId = (queueName: string) => {
  return hashData(QueueServiceType, toKebabCase(queueName));
};

export const isQueueState = (resource: EntryState): resource is QueueState => {
  return resource.type === QueueServiceType;
};

export const getQueueState = (state: EntryStates, queueName: string) => {
  const resource = getEntry(state, createQueueStateId(queueName));

  if (!isQueueState(resource)) {
    throw new EntryNotFoundError(resource.entryId);
  }

  return resource;
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
