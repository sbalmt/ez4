import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { isTopicService } from '@ez4/topic/library';
import { getServiceName } from '@ez4/project/library';

import { createTopic } from '../topic/service';
import { connectSubscriptions, prepareSubscriptions } from './subscription';
import { prepareLinkedClient } from './client';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isTopicService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareServices = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isTopicService(service)) {
    return false;
  }

  const { fifoMode } = service;

  const topicState = createTopic(state, {
    topicName: getServiceName(service, options),
    fifoMode: !!fifoMode,
    tags: options.tags
  });

  context.setServiceState(service, options, topicState);

  prepareSubscriptions(state, service, topicState, options, context);

  return true;
};

export const connectServices = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isTopicService(service)) {
    connectSubscriptions(state, service, options, context);
  }
};
