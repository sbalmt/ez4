import type { ExtraSource, ServiceEvent } from '@ez4/project/library';

import { getDefinitionName, getServiceName } from '@ez4/project/library';
import { isQueueImport, isQueueService } from '@ez4/queue/library';

import { getQueueStateId } from '../queue/utils.js';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isQueueService(service) && !isQueueImport(service)) {
    return null;
  }

  const queueName = getServiceName(service, options);
  const queueId = getQueueStateId(queueName);

  const queueUrl = getDefinitionName(queueId, 'queueUrl');
  const queueSchema = JSON.stringify(service.schema);

  return {
    entryId: queueId,
    constructor: `make(${queueUrl}, ${queueSchema})`,
    module: 'Client',
    from: '@ez4/aws-queue/client'
  };
};
