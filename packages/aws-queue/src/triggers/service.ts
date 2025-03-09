import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isQueueService } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { prepareLinkedClient } from './client.js';
import { RoleMissingError } from './errors.js';
import { getQueueName } from './utils.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isQueueService(service)) {
    return null;
  }

  return prepareLinkedClient(context, service, options);
};

export const prepareServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options, context } = event;

  if (!isQueueService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { fifoMode, timeout, retention, polling, delay } = service;

  const queueName = getQueueName(service, options);

  const queueState = createQueue(state, {
    queueName,
    fifoMode: !!fifoMode,
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(polling !== undefined && { polling }),
    ...(delay !== undefined && { delay })
  });

  context.setServiceState(queueState, service, options);

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isQueueService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  connectSubscriptions(state, service, role, options);
};
