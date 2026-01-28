import type { DeployOptions, ContextSource, EventContext } from '@ez4/project/library';
import type { QueueImport, QueueService } from '@ez4/queue/library';
import type { QueueState } from '../queue/types';

import { getDefinitionName } from '@ez4/project/library';

import { getQueueState } from '../queue/utils';

export const prepareLinkedClient = (context: EventContext, service: QueueService | QueueImport, options: DeployOptions): ContextSource => {
  const queueState = getQueueState(context, service.name, options);
  const queueId = queueState.entryId;

  const queueUrl = getDefinitionName<QueueState>(queueId, 'queueUrl');

  const fifoMode = JSON.stringify(service.fifoMode ?? null);
  const schema = JSON.stringify(service.schema);

  return {
    module: 'Client',
    from: '@ez4/aws-queue/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make(${queueUrl}, ${schema}, ${fifoMode})`,
    dependencyIds: [queueId],
    connectionIds: [queueId]
  };
};
