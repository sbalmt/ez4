import type { QueueMessageSchema } from '@ez4/queue/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { createQueueStateId } from '../queue/utils.js';

export const prepareLinkedClient = (
  queueName: string,
  messageSchema: QueueMessageSchema
): ExtraSource => {
  const queueStateId = createQueueStateId(queueName);
  const queueUrl = getDefinitionName(queueStateId, 'queueUrl');

  return {
    entryId: queueStateId,
    constructor: `make(${queueUrl}, ${JSON.stringify(messageSchema)})`,
    from: '@ez4/aws-queue/client',
    module: 'Client'
  };
};
