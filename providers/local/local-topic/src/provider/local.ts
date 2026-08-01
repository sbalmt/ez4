import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { TopicImport, TopicService } from '@ez4/topic/library';
import type { AnyObject } from '@ez4/utils';

import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { getJsonEvent, MalformedEventError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { getServiceName } from '@ez4/project/library';

import { TopicEmulatorSubscriptionType } from '../types/subscription';
import { processRemoteEvent } from '../handlers/remote';
import { processLambdaEvent } from '../handlers/lambda';
import { processQueueEvent } from '../handlers/queue';
import { createLocalClient } from '../client/local';
import { TopicManifest } from '../service/manifest';
import { InMemoryTopic } from '../service/topic';

export const registerLocalService = (service: TopicService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, schema: eventSchema } = service;

  const clientOptions = {
    ...options,
    handler: (event: AnyObject) => {
      return handleTopicEvent(service, options, context, event);
    }
  };

  return {
    type: 'Topic',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: () => {
      return createLocalClient(resourceName, eventSchema, clientOptions);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleTopicRequest(service, options, context, request);
    },
    manifestHandler: () => {
      return TopicManifest.build(service);
    }
  };
};

const handleTopicRequest = async (
  service: TopicService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorRequestEvent
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || !body) {
    throw new Error('Unsupported topic request.');
  }

  switch (path) {
    case '/':
      return handleEventRequest(service, options, context, body.toString());

    case '/unsubscribe':
      return handleUnsubscribeRequest(service, body.toString());

    case '/subscribe':
      return handleSubscribeRequest(service, body.toString());

    default:
      throw new Error('Unsupported topic operation.');
  }
};

const handleEventRequest = async (service: TopicService, options: ServeOptions, context: EmulateServiceContext, body: string) => {
  try {
    const jsonEvent = JSON.parse(body.toString());
    const safeEvent = await getJsonEvent(jsonEvent, service.schema);

    await handleTopicEvent(service, options, context, safeEvent);

    return getSuccessResponse(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedEventError)) {
      throw error;
    }

    return getErrorResponse(400, {
      message: error.message,
      context: error.context
    });
  }
};

const handleSubscribeRequest = (service: TopicService, body: string) => {
  const { resourceName, serviceHost } = JSON.parse(body);

  InMemoryTopic.createSubscription(service.name, resourceName, {
    resourceName,
    serviceHost
  });

  return getSuccessResponse(204);
};

const handleUnsubscribeRequest = (service: TopicService, body: string) => {
  const { resourceName } = JSON.parse(body);

  InMemoryTopic.deleteSubscription(service.name, resourceName);

  return getSuccessResponse(204);
};

const handleTopicEvent = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: AnyObject
) => {
  const allSubscriptions = [...InMemoryTopic.getSubscriptions(service.name), ...service.subscriptions].map((subscription) => {
    switch (subscription.type) {
      case TopicSubscriptionType.Lambda:
        return processLambdaEvent(service, options, context, subscription, event);

      case TopicSubscriptionType.Queue:
        return processQueueEvent(context, subscription, event);

      case TopicEmulatorSubscriptionType.Remote:
        return processRemoteEvent(subscription, event);
    }
  });

  await Promise.allSettled(allSubscriptions);
};
