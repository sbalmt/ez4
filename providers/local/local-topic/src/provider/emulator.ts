import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { TopicImport, TopicService } from '@ez4/topic/library';

import { isTopicImport, TopicSubscriptionType } from '@ez4/topic/library';
import { getJsonMessage, MalformedMessageError } from '@ez4/topic/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { processLambdaMessage } from '../handlers/lambda';
import { processQueueMessage } from '../handlers/queue';
import { createServiceClient } from '../client/service';
import { createImportedClient } from '../client/import';

export const registerTopicServices = (service: TopicService | TopicImport, options: ServeOptions, context: EmulateServiceContext) => {
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
      return isTopicImport(service)
        ? createImportedClient(serviceName, messageSchema, clientOptions)
        : createServiceClient(serviceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleTopicRequest(service, options, context, request);
    }
  };
};

const handleTopicRequest = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorServiceRequest
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported topic request.');
  }

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

const handleTopicMessage = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  message: AnyObject
) => {
  const allTopics = service.subscriptions.map((subscription) => {
    switch (subscription.type) {
      case TopicSubscriptionType.Lambda:
        return processLambdaMessage(service, options, context, subscription, message);

      case TopicSubscriptionType.Queue:
        return processQueueMessage(context, subscription, message);
    }
  });

  await Promise.all(allTopics);
};
