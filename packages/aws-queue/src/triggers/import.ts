import type {
  ConnectResourceEvent,
  PrepareResourceEvent,
  ServiceEvent
} from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isQueueImport } from '@ez4/queue/library';
import { isRoleState } from '@ez4/aws-identity';

import { createQueue } from '../queue/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { ProjectMissing, RoleMissing } from './errors.js';
import { prepareLinkedService } from './client.js';

export const prepareLinkedImports = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isQueueImport(service)) {
    return;
  }

  const { reference, project } = service;

  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissing(project);
  }

  const queueName = getServiceName(reference, imports[project]);

  return prepareLinkedService(queueName, service.schema);
};

export const prepareImports = async (event: PrepareResourceEvent) => {
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

export const connectImports = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isQueueImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissing();
  }

  connectSubscriptions(state, service, role, options);
};
