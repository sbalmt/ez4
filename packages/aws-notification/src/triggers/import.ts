import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isNotificationImport } from '@ez4/notification/library';
import { isRoleState } from '@ez4/aws-identity';

import { createTopic } from '../topic/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { ProjectMissingError, RoleMissingError } from './errors.js';
import { prepareLinkedClient } from './client.js';

export const prepareLinkedImports = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isNotificationImport(service)) {
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

  if (!isNotificationImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { reference, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new ProjectMissingError(project);
  }

  const topicState = createTopic(state, {
    topicName: getServiceName(reference, imports[project]),
    import: true
  });

  context.setServiceState(topicState, service, options);

  await prepareSubscriptions(state, service, role, topicState, options, context);
};

export const connectImports = (event: ConnectResourceEvent) => {
  const { state, service, role, options, context } = event;

  if (!isNotificationImport(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  connectSubscriptions(state, service, role, options, context);
};
