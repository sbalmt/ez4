import type { EntryState, StepContext } from '@ez4/stateful';
import type { QueueState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { QueueServiceType } from './types.js';

export const isQueueState = (resource: EntryState): resource is QueueState => {
  return resource.type === QueueServiceType;
};

export const getQueueArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<QueueState>(QueueServiceType).at(0)?.result;

  if (!resource?.queueArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'queueArn');
  }

  return resource.queueArn;
};
