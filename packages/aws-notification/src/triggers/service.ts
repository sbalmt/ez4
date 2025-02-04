import type {
  ConnectResourceEvent,
  PrepareResourceEvent,
  ServiceEvent
} from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isNotificationService } from '@ez4/notification/library';
import { isRoleState } from '@ez4/aws-identity';

import { createTopic } from '../topic/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { prepareLinkedService } from './client.js';
import { RoleMissingError } from './errors.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isNotificationService(service)) {
    return;
  }

  const queueName = getServiceName(service, options);

  return prepareLinkedService(queueName, service.schema);
};

export const prepareServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isNotificationService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const queueState = createTopic(state, {
    topicName: getServiceName(service, options)
  });

  await prepareSubscriptions(state, service, role, queueState, options);
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isNotificationService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  connectSubscriptions(state, service, role, options);
};
