import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { TopicImport, TopicService } from '@ez4/topic/library';
import type { AnyObject } from '@ez4/utils';

import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getJsonMessage, MalformedMessageError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { getServiceName } from '@ez4/project/library';

import { TopicEmulatorSubscriptionType } from '../types/subscription';
import { processRemoteMessage } from '../handlers/remote';
import { processLambdaMessage } from '../handlers/lambda';
import { processQueueMessage } from '../handlers/queue';
import { createLocalClient } from '../client/local';
import { InMemoryTopic } from '../service/topic';

export const registerLocalServices = (service: TopicService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, schema: messageSchema } = service;

  const clientOptions = {
    ...options,
    handler: (message: AnyObject) => {
      return handleTopicMessage(service, options, context, message);
    }
  };

  return {
    type: 'Topic',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createLocalClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleTopicRequest(service, options, context, request);
    }
  };
};

const handleTopicRequest = async (
  service: TopicService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorServiceRequest
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || !body) {
    throw new Error('Unsupported topic request.');
  }

  switch (path) {
    case '/':
      return handleMessageRequest(service, options, context, body.toString());

    case '/unsubscribe':
      return handleUnsubscribeRequest(service, body.toString());

    case '/subscribe':
      return handleSubscribeRequest(service, body.toString());

    default:
      throw new Error('Unsupported topic operation.');
  }
};

const handleMessageRequest = async (service: TopicService, options: ServeOptions, context: EmulateServiceContext, body: string) => {
  try {
    const jsonMessage = JSON.parse(body.toString());
    const safeMessage = await getJsonMessage(jsonMessage, service.schema);

    await handleTopicMessage(service, options, context, safeMessage);

    return getResponseSuccess(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedMessageError)) {
      throw error;
    }

    return getResponseError(400, {
      message: error.message,
      details: error.details
    });
  }
};

const handleSubscribeRequest = (service: TopicService, body: string) => {
  const { serviceName, serviceHost } = JSON.parse(body);

  InMemoryTopic.createSubscription(service.name, serviceName, {
    serviceName,
    serviceHost
  });

  return getResponseSuccess(204);
};

const handleUnsubscribeRequest = (service: TopicService, body: string) => {
  const { serviceName } = JSON.parse(body);

  InMemoryTopic.deleteSubscription(service.name, serviceName);

  return getResponseSuccess(204);
};

const handleTopicMessage = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  message: AnyObject
) => {
  const allSubscriptions = [...InMemoryTopic.getSubscriptions(service.name), ...service.subscriptions].map((subscription) => {
    switch (subscription.type) {
      case TopicSubscriptionType.Lambda:
        return processLambdaMessage(service, options, context, subscription, message);

      case TopicSubscriptionType.Queue:
        return processQueueMessage(context, subscription, message);

      case TopicEmulatorSubscriptionType.Remote:
        return processRemoteMessage(subscription, message);
    }
  });

  await Promise.all(allSubscriptions);
};
