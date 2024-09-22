import type { PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueImport } from '@ez4/queue/library';

import { createQueue } from '../queue/service.js';
import { prepareSubscriptions } from './subscription.js';

export const prepareQueueImports = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueImport(service)) {
    return;
  }

  const queueState = createQueue(state, {
    queueName: getServiceName(service, options),
    import: true
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};
