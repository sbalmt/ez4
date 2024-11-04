import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { isQueueImport, isQueueService } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';

export const prepareQueueImports = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueImport(service)) {
    return;
  }

  const { imports } = options;
  const { project } = service;

  if (!imports || !imports[project]) {
    throw new Error(`Imported project ${project} wasn't found.`);
  }

  const queueState = createQueue(state, {
    queueName: getServiceName(service.reference, imports[project]),
    import: true
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectQueueImports = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (isQueueService(service)) {
    connectSubscriptions(state, service, role, options);
  }
};
