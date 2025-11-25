import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { TopicImport } from '@ez4/topic/library';

import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { getJsonMessage, MalformedMessageError } from '@ez4/topic/utils';
import { TopicSubscriptionType } from '@ez4/topic/library';

import { createRemoteClient, subscribeRemoteClient, unsubscribeRemoteClient } from '../client/remote';
import { processLambdaMessage } from '../handlers/lambda';
import { processQueueMessage } from '../handlers/queue';
import { getTopicServiceHost } from '../utils/topic';

export const registerRemoteServices = (service: TopicImport, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, reference: referenceName, schema: messageSchema, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const clientOptions = {
    ...imports[project],
    remoteHost: options.serviceHost,
    remoteName: serviceName
  };

  return {
    type: 'Topic',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: () => {
      return createRemoteClient(referenceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleTopicRequest(service, options, context, request);
    },
    bootstrapHandler: async () => {
      if (!options.suppress) {
        const topicIdentifier = getServiceName(serviceName, options);
        const topicHost = getTopicServiceHost(options.serviceHost, topicIdentifier);

        await subscribeRemoteClient(referenceName, topicHost, clientOptions);
      }
    },
    shutdownHandler: async () => {
      if (!options.suppress) {
        await unsubscribeRemoteClient(referenceName, clientOptions);
      }
    }
  };
};

const handleTopicRequest = async (
  service: TopicImport,
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

    const allSubscriptions = service.subscriptions.map((subscription) => {
      switch (subscription.type) {
        case TopicSubscriptionType.Lambda:
          return processLambdaMessage(service, options, context, subscription, safeMessage);

        case TopicSubscriptionType.Queue:
          return processQueueMessage(context, subscription, safeMessage);
      }
    });

    await Promise.all(allSubscriptions);

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
