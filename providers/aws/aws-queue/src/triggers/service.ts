import type { ConnectResourceEvent, DeployOptions, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';
import type { EntryStates } from '@ez4/stateful';

import { isQueueService } from '@ez4/queue/library';

import { createQueue } from '../queue/service';
import { connectSubscriptions, prepareSubscriptions } from './subscription';
import { getDeadLetterQueueName, getQueueName } from './utils';
import { prepareLinkedClient } from './client';
import { Defaults } from './defaults';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isQueueService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isQueueService(service)) {
    return false;
  }

  const { fifoMode, retention = Defaults.Retention, timeout = Defaults.Timeout, polling, delay } = service;

  const queueDeadLetter = getDeadLetterQueue(state, service, options);

  const queueState = createQueue(state, queueDeadLetter, {
    queueName: getQueueName(service, options),
    deadLetter: service.deadLetter,
    fifoMode: !!fifoMode,
    tags: options.tags,
    retention,
    polling,
    timeout,
    delay
  });

  context.setServiceState(queueState, service, options);

  prepareSubscriptions(state, service, queueState, options, context);

  return true;
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isQueueService(service)) {
    connectSubscriptions(state, service, options, context);
  }
};

const getDeadLetterQueue = (state: EntryStates, service: QueueService, options: DeployOptions) => {
  const { fifoMode, deadLetter } = service;

  if (!deadLetter) {
    return undefined;
  }

  const { retention = Defaults.Retention } = deadLetter;

  const queueState = createQueue(state, undefined, {
    queueName: getDeadLetterQueueName(service, options),
    timeout: Defaults.Timeout,
    fifoMode: !!fifoMode,
    tags: options.tags,
    retention
  });

  return queueState;
};
