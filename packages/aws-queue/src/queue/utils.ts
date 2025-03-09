import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { QueueState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { queueUrlToArn } from '../utils/policy.js';
import { QueueNotFoundError } from './errors.js';
import { QueueServiceType } from './types.js';

export const createQueueStateId = (queueName: string, normalize = true) => {
  return hashData(QueueServiceType, normalize ? toKebabCase(queueName) : queueName);
};

export const isQueueState = (resource: EntryState): resource is QueueState => {
  return resource.type === QueueServiceType;
};

export const getQueueState = (context: EventContext, queueName: string, options: DeployOptions) => {
  const queueState = context.getServiceState(queueName, options);

  if (!isQueueState(queueState)) {
    throw new QueueNotFoundError(queueName);
  }

  return queueState;
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
