import type { ExtraSource } from '@ez4/project/library';
import type { QueueMessageSchema } from '@ez4/queue/library';

import { getDefinitionName } from '@ez4/project/library';

import { getQueueStateId } from '../queue/utils.js';

export const prepareLinkedService = (
  queueName: string,
  messageSchema: QueueMessageSchema
): ExtraSource | null => {
  const queueEntryId = getQueueStateId(queueName);
  const queueUrl = getDefinitionName(queueEntryId, 'queueUrl');

  return {
    entryId: queueEntryId,
    constructor: `make(${queueUrl}, ${JSON.stringify(messageSchema)})`,
    module: 'Client',
    from: '@ez4/aws-queue/client'
  };
};
