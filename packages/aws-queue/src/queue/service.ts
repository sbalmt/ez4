import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueParameters, QueueState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { QueueServiceType } from './types.js';
import { isQueueState } from './utils.js';

export const createQueue = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: QueueParameters
) => {
  const queueName = toKebabCase(parameters.queueName);
  const queueId = hashData(QueueServiceType, queueName);

  return attachEntry<E | QueueState, QueueState>(state, {
    type: QueueServiceType,
    entryId: queueId,
    dependencies: [],
    parameters: {
      ...parameters,
      queueName
    }
  });
};

export const getQueue = <E extends EntryState>(state: EntryStates<E>, queueName: string) => {
  const queueId = hashData(toKebabCase(queueName));
  const queueState = state[queueId];

  if (queueState && isQueueState(queueState)) {
    return queueState;
  }

  return null;
};
