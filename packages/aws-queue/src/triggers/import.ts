import type { ConnectResourceEvent, PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueImport } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { ProjectMissing, RoleMissing } from './errors.js';

export const prepareQueueImports = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissing();
  }

  const { reference, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissing(project);
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
    throw new RoleMissing();
  }

  connectSubscriptions(state, service, role, options);
};
