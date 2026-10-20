import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { TopicImport, TopicService } from '@ez4/topic/library';
import type { HttpProviderRequest } from '@ez4/server';
import type { AnyObject } from '@ez4/utils';
import type { ProviderTopicEvent } from '../types/events';

import { registerProvider as registerEmulatorProvider, unregisterProvider as unregisterEmulatorProvider } from '@ez4/emulator';
import { ProviderType, registerProvider as registerServerProvider, unregisterProvider as unregisterServerProvider } from '@ez4/server';
import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { getJsonEvent, MalformedEventError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { getServiceName } from '@ez4/project/library';

import { TopicEmulatorSubscriptionType } from '../types/subscription';
import { processRemoteEvent } from '../handlers/remote';
import { processLambdaEvent } from '../handlers/lambda';
import { processQueueEvent } from '../handlers/queue';
import { TopicManifest } from '../service/manifest';
import { InMemoryTopic } from '../service/topic';
import { ProviderEvent } from '../types/events';

export const registerLocalService = (service: TopicService, options: ServeOptions, context: EmulateServiceContext): ServiceEmulator => {
  const { name: resourceName, schema: eventSchema } = service;

  const identifier = getServiceName(resourceName, options);
  const provider = `topic:${identifier}`;

  return {
    type: 'Topic',
    name: resourceName,
    options: service.options,
    identifier,
    bootstrapHandler: () => {
      registerEmulatorProvider(provider, {
        eventTypes: [ProviderEvent.PublishEvent],
        eventHandler: (_event: string, payload: ProviderTopicEvent | undefined) => {
          if (!payload) {
            throw new Error('Missing topic event payload.');
          }

          return handleTopicEvent(service, options, context, payload.event);
        }
      });

      registerServerProvider(identifier, {
        type: ProviderType.Http,
        requestHandler: (request) => {
          return handleTopicRequest(service, options, context, request);
        }
      });
    },
    shutdownHandler: () => {
      unregisterServerProvider(identifier);
      unregisterEmulatorProvider(provider);
    },
    exportDescriptor: () => {
      return {
        name: 'makeLocalService',
        module: '@ez4/local-topic/worker',
        provider,
        options: {
          identifier,
          schema: eventSchema
        }
      };
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
  request: HttpProviderRequest
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
