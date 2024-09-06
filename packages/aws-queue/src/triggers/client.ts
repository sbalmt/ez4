import type { ExtraSource, ServiceEvent } from '@ez4/project/library';

import { getAccountId, getRegion } from '@ez4/aws-identity';
import { isQueueService } from '@ez4/queue/library';

import { getQueueName } from './utils.js';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isQueueService(service)) {
    return null;
  }

  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const queueName = getQueueName(service, options);
  const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

  return {
    constructor: `make('${queueUrl}', ${JSON.stringify(service.schema)})`,
    module: 'Client',
    from: '@ez4/aws-queue/client'
  };
};
