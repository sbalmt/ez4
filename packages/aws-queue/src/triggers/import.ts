import type { PrepareResourceEvent } from '@ez4/project/library';

import { isQueueImport } from '@ez4/queue/library';
import { getServiceName } from '@ez4/project/library';

import { createQueue } from '../queue/service.js';
import { prepareSubscriptions } from './subscription.js';

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
