import type { ConnectResourceEvent, DeployOptions, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';

import { isQueueService } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { getDeadLetterQueueName, getQueueName } from './utils.js';
import { prepareLinkedClient } from './client.js';
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

  const queueDeadLetter = getDeadLetterQueue(state, service, options);

  const queueState = createQueue(state, queueDeadLetter, {
    queueName: getQueueName(service, options),
    timeout: timeout ?? Defaults.Timeout,
    deadLetter: service.deadLetter,
    fifoMode: !!fifoMode,
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

const getDeadLetterQueue = (state: EntryStates, service: QueueService, options: DeployOptions) => {
  const { fifoMode, retention, deadLetter } = service;

  if (!deadLetter) {
    return undefined;
  }

  const queueState = createQueue(state, undefined, {
    queueName: getDeadLetterQueueName(service, options),
    fifoMode: !!fifoMode,
    tags: options.tags,
    ...(retention !== undefined && { retention })
  });

  return queueState;
};
