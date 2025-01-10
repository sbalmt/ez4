import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';
import { QueueMessage } from '@ez4/queue/library';

import { getQueueStateId } from '../queue/utils.js';

export const prepareLinkedService = (
  queueName: string,
  queueSchema: QueueMessage
): ExtraSource | null => {
  const queueEntryId = getQueueStateId(queueName);
  const queueUrl = getDefinitionName(queueEntryId, 'queueUrl');

  return {
    entryId: queueEntryId,
    constructor: `make(${queueUrl}, ${JSON.stringify(queueSchema)})`,
    module: 'Client',
    from: '@ez4/aws-queue/client'
  };
};
