import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isQueueImport } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { ProjectMissingError, RoleMissingError } from './errors.js';
import { prepareLinkedClient } from './client.js';
import { getQueueName } from './utils.js';

export const prepareLinkedImports = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isQueueImport(service)) {
    return null;
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissingError(project);
  }

  return prepareLinkedClient(context, service, imports[project]);
};

export const prepareImports = async (event: PrepareResourceEvent) => {
  const { state, service, options, role, context } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissingError(project);
  }

  const queueName = getQueueName(service, imports[project]);

  const queueState = createQueue(state, {
    fifoMode: !!service.fifoMode,
    import: true,
    queueName
  });

  context.setServiceState(queueState, service, options);

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectImports = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  connectSubscriptions(state, service, role, options);
};
