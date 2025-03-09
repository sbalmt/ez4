import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isNotificationService } from '@ez4/notification/library';
import { getServiceName } from '@ez4/project/library';

import { createTopic } from '../topic/service.js';
import { connectSubscriptions, prepareSubscriptions } from './subscription.js';
import { prepareLinkedClient } from './client.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isNotificationService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isNotificationService(service)) {
    return;
  }

  const topicState = createTopic(state, {
    topicName: getServiceName(service, options)
  });

  context.setServiceState(topicState, service, options);

  await prepareSubscriptions(state, service, topicState, options, context);
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isNotificationService(service)) {
    connectSubscriptions(state, service, options, context);
  }
};
