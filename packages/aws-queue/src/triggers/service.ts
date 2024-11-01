import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName, linkServiceExtras } from '@ez4/project/library';
import { isQueueService } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { getQueueStateId } from '../queue/utils.js';
import { prepareSubscriptions } from './subscription.js';

export const prepareQueueServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueService(service)) {
    return;
  }

  const { timeout, retention, polling, delay } = service;

  const queueState = createQueue(state, {
    queueName: getServiceName(service, options),
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(polling !== undefined && { polling }),
    ...(delay !== undefined && { delay })
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectQueueServices = (event: ConnectResourceEvent) => {
  const { state, service } = event;

  if (!isQueueService(service) || !service.extras) {
    return;
  }

  const queueId = getQueueStateId(service.name);

  linkServiceExtras(state, queueId, service.extras);
};
