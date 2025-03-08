import type {
  ConnectResourceEvent,
  PrepareResourceEvent,
  ServiceEvent
} from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueService } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { prepareLinkedClient } from './client.js';
import { RoleMissingError } from './errors.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isQueueService(service)) {
    return null;
  }

  const queueName = getServiceName(service, options);

  return prepareLinkedClient(queueName, service.schema, service.fifoMode);
};

export const prepareServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isQueueService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { fifoMode, timeout, retention, polling, delay } = service;

  const queueName = getServiceName(service, options);

  const queueState = createQueue(state, {
    queueName,
    fifoMode: !!fifoMode,
    ...(timeout !== undefined && { timeout }),
    ...(retention !== undefined && { retention }),
    ...(polling !== undefined && { polling }),
    ...(delay !== undefined && { delay })
  });

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
