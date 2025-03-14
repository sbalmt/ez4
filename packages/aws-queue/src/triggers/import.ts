import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isQueueImport } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { ProjectMissingError } from './errors.js';
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
  const { state, service, options, context } = event;

  if (!isQueueImport(service)) {
    return;
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissingError(project);
  }

  const queueState = createQueue(state, {
    queueName: getQueueName(service, imports[project]),
    fifoMode: !!service.fifoMode,
    import: true
  });

  context.setServiceState(queueState, service, imports[project]);

  await prepareSubscriptions(state, service, queueState, options, context);
};

export const connectImports = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isQueueImport(service)) {
    connectSubscriptions(state, service, options, context);
  }
};
