import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueService } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';

export const prepareQueueServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

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
  const { state, service, role, options } = event;

  if (isQueueService(service)) {
    connectSubscriptions(state, service, role, options);
  }
};
