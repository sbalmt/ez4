import type { QueueFifoMode, QueueMessageSchema } from '@ez4/queue/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { createQueueStateId } from '../queue/utils.js';
import { QueueState } from '../queue/types.js';

export const prepareLinkedClient = (queueName: string, messageSchema: QueueMessageSchema, fifoMode?: QueueFifoMode): ExtraSource => {
  const stateId = createQueueStateId(queueName);

  const queueUrl = getDefinitionName<QueueState>(stateId, 'queueUrl');

  const schema = JSON.stringify(messageSchema);
  const mode = JSON.stringify(fifoMode ?? null);

  return {
    entryId: stateId,
    constructor: `make(${queueUrl}, ${schema}, ${mode})`,
    from: '@ez4/aws-queue/client',
    module: 'Client'
  };
};
