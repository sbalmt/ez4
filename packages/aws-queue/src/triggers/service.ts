import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isQueueService } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { prepareLinkedClient } from './client.js';
import { getQueueName } from './utils.js';
import { Defaults } from './defaults.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isQueueService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isQueueService(service)) {
    return;
  }

  const { fifoMode, timeout, retention, polling, delay } = service;

  const queueState = createQueue(state, {
    queueName: getQueueName(service, options),
    fifoMode: !!fifoMode,
    timeout: timeout ?? Defaults.Timeout,
    tags: options.tags,
    ...(retention !== undefined && { retention }),
    ...(polling !== undefined && { polling }),
    ...(delay !== undefined && { delay })
  });

  context.setServiceState(queueState, service, options);

  await prepareSubscriptions(state, service, queueState, options, context);
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isQueueService(service)) {
    connectSubscriptions(state, service, options, context);
  }
};
