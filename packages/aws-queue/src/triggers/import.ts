import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueImport } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';

export const prepareQueueImports = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for SQS is missing.`);
  }

  const { reference, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new Error(`Imported project ${project} wasn't found.`);
  }

  const queueState = createQueue(state, {
    queueName: getServiceName(reference, imports[project]),
    import: true
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectQueueImports = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for SQS is missing.`);
  }

  connectSubscriptions(state, service, role, options);
};
