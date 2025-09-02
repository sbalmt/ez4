import type { DeployOptions, ExtraSource, EventContext } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { QueueState } from '../queue/types';

import { getDefinitionName } from '@ez4/project/library';

import { getQueueState } from '../queue/utils';

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
