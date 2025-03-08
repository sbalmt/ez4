import type { DeployOptions, ExtraSource } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';

import { getDefinitionName } from '@ez4/project/library';

import { QueueState } from '../queue/types.js';
import { createQueueStateId } from '../queue/utils.js';
import { getQueueName } from './utils.js';

export const prepareLinkedClient = (service: QueueService | QueueImport, options: DeployOptions): ExtraSource => {
  const localName = getQueueName(service, options);
  const queueName = service.fifoMode ? `${localName}.fifo` : localName;

  const stateId = createQueueStateId(queueName, false);

  const queueUrl = getDefinitionName<QueueState>(stateId, 'queueUrl');

  const fifoMode = JSON.stringify(service.fifoMode ?? null);
  const schema = JSON.stringify(service.schema);

  return {
    entryId: stateId,
    constructor: `make(${queueUrl}, ${schema}, ${fifoMode})`,
    from: '@ez4/aws-queue/client',
    module: 'Client'
  };
};
