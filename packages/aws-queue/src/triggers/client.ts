import type { QueueMessageSchema } from '@ez4/queue/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { getQueueStateId } from '../queue/utils.js';

export const prepareLinkedClient = (
  queueName: string,
  messageSchema: QueueMessageSchema
): ExtraSource => {
  const queueEntryId = getQueueStateId(queueName);
  const queueUrl = getDefinitionName(queueEntryId, 'queueUrl');

  return {
    entryId: queueEntryId,
    constructor: `make(${queueUrl}, ${JSON.stringify(messageSchema)})`,
    from: '@ez4/aws-queue/client',
    module: 'Client'
  };
};
