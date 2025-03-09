import type { DeployOptions, ExtraSource, EventContext } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';

import { getDefinitionName } from '@ez4/project/library';

import { QueueState } from '../queue/types.js';
import { getQueueState } from '../queue/utils.js';

export const prepareLinkedClient = (context: EventContext, service: QueueService | QueueImport, options: DeployOptions): ExtraSource => {
  const queueState = getQueueState(context, service.name, options);
  const queueId = queueState.entryId;

  const queueUrl = getDefinitionName<QueueState>(queueId, 'queueUrl');

  const fifoMode = JSON.stringify(service.fifoMode ?? null);
  const schema = JSON.stringify(service.schema);

  return {
    entryIds: [queueId],
    constructor: `make(${queueUrl}, ${schema}, ${fifoMode})`,
    from: '@ez4/aws-queue/client',
    module: 'Client'
  };
};
