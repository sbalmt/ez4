import type { EntryState, StepContext } from '@ez4/stateful';
import type { QueueState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { QueueServiceType } from './types.js';

export const isQueueState = (resource: EntryState): resource is QueueState => {
  return resource.type === QueueServiceType;
};

export const getQueueStateId = (queueName: string) => {
  return hashData(QueueServiceType, toKebabCase(queueName));
};

export const getQueueArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<QueueState>(QueueServiceType).at(0)?.result;

  if (!resource?.queueArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'queueArn');
  }

  return resource.queueArn;
};
