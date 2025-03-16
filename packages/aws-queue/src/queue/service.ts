import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueParameters, QueueState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { createQueueStateId } from './utils.js';
import { QueueServiceType } from './types.js';

export const createQueue = <E extends EntryState>(state: EntryStates<E>, parameters: QueueParameters) => {
  const localName = toKebabCase(parameters.queueName);
  const queueName = parameters.fifoMode ? `${localName}.fifo` : localName;

  const queueId = createQueueStateId(queueName, false);

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
